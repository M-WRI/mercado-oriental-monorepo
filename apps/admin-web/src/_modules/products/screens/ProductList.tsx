import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import { usePost, useDelete } from "@/_shared/queryProvider";
import { useListQuery } from "@/_shared/hooks";
import { Button, Tag, ConfirmDialog, useToast, QueryError } from "@mercado/shared-ui";
import { Table, TablePagination } from "@mercado/shared-ui/components/table";
import { TableFilters } from "@mercado/shared-ui/components/tableFilters";
import { getProducts } from "../api";
import { bulkAdjustInventory } from "@/_modules/inventory/api";
import { getNotifications } from "@/_modules/notifications/api";
import { getDashboard } from "@/_modules/dashboard/api";
import { MdAdd, MdDeleteOutline, MdChevronRight } from "react-icons/md";
import type { FilterConfig } from "@mercado/shared-ui";

interface IVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLow: boolean;
  isOut: boolean;
}

interface IProductListItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  variantCount: number;
  priceMin: number;
  priceMax: number;
  totalStock: number;
  totalSold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  variants: IVariant[];
  createdAt: string;
}

type TableRow =
  | {
      id: string;
      _type: "product";
      product: IProductListItem;
      subRows: TableRow[];
    }
  | {
      id: string;
      _type: "variant";
      variant: IVariant;
      productId: string;
      subRows?: undefined;
    };

type ConfirmState =
  | { type: "product"; product: IProductListItem }
  | { type: "bulk" }
  | { type: "variant"; productId: string; variantId: string; variantName: string };

export const ProductList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  // ── Filters config ──────────────────────────────────────────────
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        type: "search",
        placeholder: t("filters.searchProducts"),
      },
      {
        type: "select",
        paramKey: "isActive",
        label: t("products.activeStatus"),
        options: [
          { value: "true", label: t("products.active") },
          { value: "false", label: t("products.inactive") },
        ],
      },
      {
        type: "sort",
        options: [
          { value: "createdAt", label: t("filters.sortDate") },
          { value: "name", label: t("filters.sortName") },
        ],
      },
    ],
    [t],
  );

  // ── Server query ────────────────────────────────────────────────
  const {
    data: products,
    meta,
    isLoading,
    isError,
    refetch,
    params,
    setSearch,
    setFilter,
    setSorting,
    setPage,
    setPageSize,
  } = useListQuery<IProductListItem>({
    queryKey: getProducts.queryKey,
    url: getProducts.url,
  });

  // ── Local UI state ──────────────────────────────────────────────
  const [deltas, setDeltas] = useState<Record<string, string>>({});
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const { mutate: postBulk, isPending: isApplying } = usePost();
  const { mutate: deleteOne, isPending: isDeletingOne } = useDelete();
  const { mutate: deleteBulk, isPending: isDeletingBulk } = useDelete();
  const { mutate: deleteVariant, isPending: isDeletingVariant } = useDelete();
  const isDeleting = isDeletingOne || isDeletingBulk;

  const list = products;

  const tableData: TableRow[] = useMemo(
    () =>
      list.map((product) => ({
        id: product.id,
        _type: "product" as const,
        product,
        subRows: product.variants.map((v) => ({
          id: v.id,
          _type: "variant" as const,
          variant: v,
          productId: product.id,
        })),
      })),
    [list],
  );

  const defaultExpanded = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const row of tableData) {
      if (row._type === "product" && row.product.variants.some((v) => v.isLow || v.isOut)) {
        map[row.id] = true;
      }
    }
    return map;
  }, [tableData]);

  const alertCount = useMemo(
    () => list.reduce((n, p) => n + p.variants.filter((v) => v.isLow || v.isOut).length, 0),
    [list],
  );

  const pendingCount = Object.values(deltas).filter(
    (v) => v !== "" && !Number.isNaN(parseInt(v, 10)) && parseInt(v, 10) !== 0,
  ).length;

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getProducts.queryKey });
    queryClient.invalidateQueries({ queryKey: getDashboard.queryKey });
    queryClient.invalidateQueries({ queryKey: getNotifications.queryKey });
  }, [queryClient]);

  const handleApply = () => {
    const items = Object.entries(deltas)
      .map(([variantId, raw]) => ({ variantId, stockDelta: parseInt(raw, 10) }))
      .filter((x) => !Number.isNaN(x.stockDelta) && x.stockDelta !== 0);
    if (items.length === 0) return;
    postBulk(
      { url: bulkAdjustInventory.url, data: { items } },
      {
        onSuccess: () => {
          setDeltas({});
          invalidateQueries();
        },
      },
    );
  };

  const [selectedProducts, setSelectedProducts] = useState<TableRow[]>([]);

  const executeDelete = () => {
    if (!confirmState) return;
    if (confirmState.type === "product") {
      deleteOne(
        { url: `/products/${confirmState.product.id}` },
        {
          onSuccess: () => {
            toastSuccess(t("success.product_deleted"));
            invalidateQueries();
            setConfirmState(null);
          },
        },
      );
    } else if (confirmState.type === "bulk") {
      const ids = selectedProducts.filter((r) => r._type === "product").map((r) => r.id);
      deleteBulk(
        { url: "/products/bulk", data: { ids } },
        {
          onSuccess: () => {
            toastSuccess(t("products.bulkDeleteSuccess", { count: ids.length }));
            invalidateQueries();
            setConfirmState(null);
          },
        },
      );
    } else {
      deleteVariant(
        { url: `/products/${confirmState.productId}/variants/${confirmState.variantId}` },
        {
          onSuccess: () => {
            toastSuccess(t("success.variant_deleted"));
            invalidateQueries();
            setConfirmState(null);
          },
        },
      );
    }
  };

  const stockLabel = (status: IProductListItem["status"]) => {
    const map = {
      in_stock: { label: t("products.inStock"), variant: "success" as const },
      low_stock: { label: t("products.lowStock"), variant: "warning" as const },
      out_of_stock: { label: t("products.outOfStock"), variant: "danger" as const },
    };
    return map[status];
  };

  const columns: ColumnDef<TableRow>[] = useMemo(
    () => [
      {
        id: "expand",
        header: () => null,
        cell: ({ row }) => {
          if (row.depth > 0) return null;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
              className="p-0.5 rounded text-gray-400 hover:text-gray-600"
            >
              <MdChevronRight
                size={18}
                className={`transition-transform duration-150 ${row.getIsExpanded() ? "rotate-90" : ""}`}
              />
            </button>
          );
        },
        meta: { className: "w-8 min-w-[32px]" },
      },
      {
        id: "name",
        header: () => t("products.product"),
        cell: ({ row }) => {
          if (row.original._type === "product") {
            const p = row.original.product;
            return (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{p.name}</span>
                <span className="text-xs text-gray-400">
                  {p.variants.length}{" "}
                  {p.variants.length === 1 ? t("common.variant") : t("common.variant_plural")}
                </span>
              </div>
            );
          }
          return <span className="text-gray-600 pl-4">{row.original.variant.name}</span>;
        },
      },
      {
        id: "stockStatus",
        header: () => t("products.status"),
        cell: ({ row }) => {
          if (row.original._type === "product") {
            const st = stockLabel(row.original.product.status);
            return (
              <Tag variant={st.variant} dot>
                {st.label}
              </Tag>
            );
          }
          const v = row.original.variant;
          if (v.isOut)
            return (
              <Tag variant="danger" dot>
                {t("products.outOfStock")}
              </Tag>
            );
          if (v.isLow)
            return (
              <Tag variant="warning" dot>
                {t("products.lowStock")}
              </Tag>
            );
          return (
            <Tag variant="success" dot>
              {t("products.inStock")}
            </Tag>
          );
        },
        meta: { className: "w-28 min-w-[112px] text-center" },
      },
      {
        id: "active",
        header: () => t("products.activeStatus"),
        cell: ({ row }) => {
          if (row.original._type !== "product") return null;
          const p = row.original.product;
          return (
            <Tag variant={p.isActive ? "success" : "default"} dot>
              {p.isActive ? t("products.active") : t("products.inactive")}
            </Tag>
          );
        },
        meta: { className: "w-24 min-w-[96px] text-center" },
      },
      {
        id: "available",
        header: () => t("inventory.available"),
        cell: ({ row }) => {
          if (row.original._type === "product") {
            return (
              <span className="font-medium tabular-nums text-gray-700">
                {row.original.product.totalStock}
              </span>
            );
          }
          const v = row.original.variant;
          const delta = deltas[v.id] ?? "";
          const parsed = parseInt(delta, 10) || 0;
          const preview = v.availableStock + parsed;
          return (
            <span className="tabular-nums">
              <span
                className={`font-medium ${
                  v.isOut ? "text-red-600" : v.isLow ? "text-amber-600" : "text-gray-900"
                }`}
              >
                {v.availableStock}
              </span>
              {parsed !== 0 && (
                <span className={`ml-1.5 text-xs ${preview <= 0 ? "text-red-500" : "text-green-600"}`}>
                  → {preview}
                </span>
              )}
            </span>
          );
        },
        meta: { className: "w-28 min-w-[112px] text-right" },
      },
      {
        id: "adjust",
        header: () => t("inventory.addRemove"),
        cell: ({ row }) => {
          if (row.original._type !== "variant") return null;
          const v = row.original.variant;
          const delta = deltas[v.id] ?? "";
          return (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  setDeltas((p) => ({
                    ...p,
                    [v.id]: String((parseInt(p[v.id] ?? "0", 10) || 0) - 1),
                  }))
                }
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm font-medium"
              >
                −
              </button>
              <input
                type="number"
                className="w-14 rounded border border-gray-200 px-2 py-1 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
                value={delta}
                onChange={(e) => setDeltas((p) => ({ ...p, [v.id]: e.target.value }))}
              />
              <button
                type="button"
                onClick={() =>
                  setDeltas((p) => ({
                    ...p,
                    [v.id]: String((parseInt(p[v.id] ?? "0", 10) || 0) + 1),
                  }))
                }
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm font-medium"
              >
                +
              </button>
            </div>
          );
        },
        meta: { className: "w-36 min-w-[144px] text-right" },
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          if (row.original._type === "product") {
            const p = row.original.product;
            return (
              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  style="primaryOutline"
                  className="!text-xs !px-2 !py-1"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  {t("common.show")}
                </Button>
                <Button
                  style="primary"
                  className="!text-xs !px-2 !py-1"
                  onClick={() => navigate(`/products/${p.id}/edit`)}
                >
                  {t("common.edit")}
                </Button>
                <button
                  type="button"
                  onClick={() => setConfirmState({ type: "product", product: p })}
                  className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <MdDeleteOutline size={16} />
                </button>
              </div>
            );
          }
          const orig = row.original;
          if (orig._type !== "variant") return null;
          const v = orig.variant;
          return (
            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  setConfirmState({
                    type: "variant",
                    productId: orig.productId,
                    variantId: v.id,
                    variantName: v.name,
                  })
                }
                className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label={t("products.deleteVariantAria")}
              >
                <MdDeleteOutline size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [t, deltas, navigate, setDeltas, setConfirmState],
  );

  const handleRowClick = useCallback((row: Row<TableRow>) => {
    if (row.depth === 0) row.toggleExpanded();
  }, []);

  const rowClassName = useCallback((row: Row<TableRow>) => {
    return row.depth > 0 ? "bg-gray-50/40" : "";
  }, []);

  const confirmTitle =
    confirmState?.type === "product"
      ? t("products.deleteConfirmTitle")
      : confirmState?.type === "bulk"
        ? t("products.bulkDeleteConfirmTitle", { count: selectedProducts.length })
        : confirmState?.type === "variant"
          ? t("products.deleteVariantTitle")
          : "";

  const confirmMessage =
    confirmState?.type === "product"
      ? t("products.deleteConfirmMessage", { name: confirmState.product.name })
      : confirmState?.type === "bulk"
        ? t("products.bulkDeleteConfirmMessage", { count: selectedProducts.length })
        : confirmState?.type === "variant"
          ? t("products.deleteVariantMessage", { name: confirmState.variantName })
          : "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (isError) {
    return <QueryError onRetry={() => refetch()} />;
  }

  return (
    <>
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="shrink-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{t("products.title")}</h4>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("filters.totalResults", { count: meta.total })}
              {alertCount > 0 && (
                <span className="text-red-500 font-medium">
                  {" · "}
                  {alertCount} {t("inventory.alertCount").toLowerCase()}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pendingCount > 0 && (
              <>
                <Button style="primaryOutline" onClick={() => setDeltas({})}>
                  {t("inventory.clearChanges")}
                </Button>
                <Button onClick={handleApply} disabled={isApplying}>
                  {isApplying ? t("common.loading") : t("inventory.applyCount", { count: pendingCount })}
                </Button>
              </>
            )}
            <Button onClick={() => navigate("/products/create")} icon={<MdAdd size={16} />}>
              {t("products.createProduct")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="shrink-0 mb-4">
          <TableFilters
            filters={filterConfigs}
            search={params.search}
            onSearchChange={setSearch}
            activeFilters={params.filters}
            onFilterChange={setFilter}
            sortField={params.sort}
            sortOrder={params.order}
            onSort={setSorting}
          />
        </div>

        {/* Bulk bar */}
        {selectedProducts.length > 0 && (
          <div className="shrink-0 flex items-center gap-3 mb-3 px-4 py-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <span className="text-sm font-medium text-indigo-700">
              {t("common.selected", { count: selectedProducts.length })}
            </span>
            <div className="h-4 w-px bg-indigo-200" />
            <Button
              onClick={() => setConfirmState({ type: "bulk" })}
              style="danger"
              icon={<MdDeleteOutline size={16} />}
            >
              {t("products.bulkDelete", { count: selectedProducts.length })}
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 min-h-0">
          <Table
            data={tableData}
            columns={columns}
            isMultiSelect
            onSelectionChange={setSelectedProducts}
            getRowId={(row) => row.id}
            getSubRows={(row) => row.subRows}
            defaultExpanded={defaultExpanded}
            onRowClick={handleRowClick}
            rowClassName={rowClassName}
          />
        </div>

        {/* Pagination */}
        <div className="shrink-0">
          <TablePagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {confirmState && (
        <ConfirmDialog
          title={confirmTitle}
          message={confirmMessage}
          confirmLabel={t("common.delete")}
          onConfirm={executeDelete}
          onCancel={() => setConfirmState(null)}
          isLoading={confirmState.type === "variant" ? isDeletingVariant : isDeleting}
        />
      )}
    </>
  );
};
