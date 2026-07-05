import { useMemo, useCallback } from "react";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import { Button, Tag } from "@mercado/shared-ui";
import { Table, TablePagination } from "@mercado/shared-ui/components/table";
import { TableFilters } from "@mercado/shared-ui/components/tableFilters";
import { MdChevronRight } from "react-icons/md";
import type { useInventoryList } from "../hooks/useInventoryList";
import type { TableRow } from "@/_modules/products/hooks/useProductList";
import { InventoryHistoryModal } from "./InventoryHistoryModal";

type InventoryListState = ReturnType<typeof useInventoryList>;

interface InventoryListViewProps {
  list: InventoryListState;
}

export function InventoryListView({ list }: InventoryListViewProps) {
  const {
    t,
    navigate,
    paths,
    filterConfigs,
    meta,
    params,
    setSearch,
    setSorting,
    setPage,
    setPageSize,
    deltas,
    setDeltas,
    alertsOnly,
    setAlertsOnly,
    historyVariant,
    setHistoryVariant,
    isApplying,
    tableData,
    defaultExpanded,
    stats,
    pendingCount,
    handleApply,
    stockLabel,
    filteredCount,
  } = list;

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
        header: () => t("inventory.variant"),
        cell: ({ row }) => {
          if (row.original._type === "product") {
            const p = row.original.product;
            return (
              <div className="flex items-center gap-2.5">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="w-9 h-9 rounded-md object-cover border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-md bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center text-xs font-medium text-gray-400">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-gray-900">{p.name}</span>
              </div>
            );
          }
          return <span className="text-gray-600 pl-4">{row.original.variant.name}</span>;
        },
      },
      {
        id: "onHand",
        header: () => t("inventory.onHand"),
        cell: ({ row }) => {
          if (row.original._type !== "variant") return null;
          return (
            <span className="tabular-nums text-gray-700">{row.original.variant.stock}</span>
          );
        },
        meta: { className: "w-24 min-w-[96px] text-right" },
      },
      {
        id: "reserved",
        header: () => t("inventory.reserved"),
        cell: ({ row }) => {
          if (row.original._type !== "variant") return null;
          return (
            <span className="tabular-nums text-gray-500">
              {row.original.variant.reservedStock}
            </span>
          );
        },
        meta: { className: "w-24 min-w-[96px] text-right" },
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
                <span
                  className={`ml-1.5 text-xs ${preview <= 0 ? "text-red-500" : "text-green-600"}`}
                >
                  → {preview}
                </span>
              )}
            </span>
          );
        },
        meta: { className: "w-28 min-w-[112px] text-right" },
      },
      {
        id: "threshold",
        header: () => t("inventory.threshold"),
        cell: ({ row }) => {
          if (row.original._type !== "variant") return null;
          return (
            <span className="tabular-nums text-gray-500">
              {row.original.variant.lowStockThreshold}
            </span>
          );
        },
        meta: { className: "w-24 min-w-[96px] text-right" },
      },
      {
        id: "status",
        header: () => t("inventory.status"),
        cell: ({ row }) => {
          if (row.original._type !== "variant") return null;
          const st = stockLabel(row.original.variant);
          return (
            <Tag variant={st.variant} dot>
              {st.label}
            </Tag>
          );
        },
        meta: { className: "w-28 min-w-[112px]" },
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
              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                <Button
                  style="primaryOutline"
                  className="!text-xs !px-2 !py-1"
                  onClick={() => navigate(paths.product(p.id))}
                >
                  {t("common.show")}
                </Button>
              </div>
            );
          }
          const orig = row.original;
          if (orig._type !== "variant") return null;
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <Button
                style="link"
                className="!text-xs !p-0"
                onClick={() =>
                  setHistoryVariant({ id: orig.variant.id, name: orig.variant.name })
                }
              >
                {t("inventory.viewHistory")}
              </Button>
            </div>
          );
        },
      },
    ],
    [t, deltas, navigate, paths, setDeltas, setHistoryVariant, stockLabel]
  );

  const handleRowClick = useCallback((row: Row<TableRow>) => {
    if (row.depth === 0) row.toggleExpanded();
  }, []);

  const rowClassName = useCallback((row: Row<TableRow>) => {
    return row.depth > 0 ? "bg-gray-50/40" : "";
  }, []);

  return (
    <>
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{t("inventory.title")}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{t("inventory.subtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pendingCount > 0 && (
              <>
                <Button style="primaryOutline" onClick={() => setDeltas({})}>
                  {t("inventory.clearChanges")}
                </Button>
                <Button onClick={handleApply} disabled={isApplying}>
                  {isApplying
                    ? t("common.loading")
                    : t("inventory.applyCount", { count: pendingCount })}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">{t("inventory.totalProducts", { count: stats.productCount })}</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{stats.productCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">{t("inventory.totalVariants", { count: stats.variantCount })}</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{stats.variantCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">{t("inventory.totalAvailable")}</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{stats.totalAvailable}</p>
          </div>
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">{t("inventory.alertCount")}</p>
            <p className={`text-xl font-semibold mt-1 ${stats.alertCount > 0 ? "text-red-600" : "text-gray-900"}`}>
              {stats.alertCount}
            </p>
          </div>
        </div>

        <div className="shrink-0 mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TableFilters
            filters={filterConfigs}
            search={params.search}
            onSearchChange={setSearch}
            activeFilters={params.filters}
            onFilterChange={() => undefined}
            sortField={params.sort}
            sortOrder={params.order}
            onSort={setSorting}
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 shrink-0">
            <input
              type="checkbox"
              checked={alertsOnly}
              onChange={(e) => setAlertsOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            {t("products.showAlertsOnly")}
          </label>
        </div>

        <p className="shrink-0 text-sm text-gray-500 mb-3">
          {t("filters.totalResults", { count: alertsOnly ? filteredCount : meta.total })}
        </p>

        <div className="flex-1 min-h-0">
          <Table
            data={tableData}
            columns={columns}
            getRowId={(row) => row.id}
            getSubRows={(row) => row.subRows}
            defaultExpanded={defaultExpanded}
            onRowClick={handleRowClick}
            rowClassName={rowClassName}
          />
        </div>

        {!alertsOnly && (
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
        )}
      </div>

      {historyVariant && (
        <InventoryHistoryModal
          variantId={historyVariant.id}
          variantName={historyVariant.name}
          onClose={() => setHistoryVariant(null)}
        />
      )}
    </>
  );
}
