import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { usePost, useDelete } from "@/_shared/queryProvider";
import { useListQuery } from "@/_shared/hooks";
import { useToast } from "@mercado/shared-ui";
import { getProducts } from "../api";
import { bulkAdjustInventory } from "@/_modules/inventory/api";
import { getNotifications } from "@/_modules/notifications/api";
import { getDashboard } from "@/_modules/dashboard/api";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import type { FilterConfig } from "@mercado/shared-ui";

export interface IVariant {
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

export interface IProductListItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  variantCount: number;
  priceMin: number;
  priceMax: number;
  totalStock: number;
  totalSold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  variants: IVariant[];
  categories: { id: string; name: string; slug: string }[];
  createdAt: string;
}

export type TableRow =
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

export type ConfirmState =
  | { type: "product"; product: IProductListItem }
  | { type: "bulk" }
  | { type: "variant"; productId: string; variantId: string; variantName: string };

export function useProductList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { shopId, paths } = useShop();

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
    [t]
  );

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
    queryKey: getProducts.queryKey(shopId),
    url: getProducts.url,
    staticFilters: { shopId },
  });

  const [deltas, setDeltas] = useState<Record<string, string>>({});
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<TableRow[]>([]);

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
    [list]
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
    [list]
  );

  const pendingCount = Object.values(deltas).filter(
    (v) => v !== "" && !Number.isNaN(parseInt(v, 10)) && parseInt(v, 10) !== 0
  ).length;

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getProducts.queryKey(shopId) });
    queryClient.invalidateQueries({ queryKey: getDashboard.queryKey(shopId) });
    queryClient.invalidateQueries({ queryKey: getNotifications.queryKey(shopId) });
  }, [queryClient, shopId]);

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
      }
    );
  };

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
        }
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
        }
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
        }
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

  const confirmIsLoading =
    confirmState?.type === "variant" ? isDeletingVariant : isDeleting;

  return {
    t,
    navigate,
    paths,
    filterConfigs,
    products: list,
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
    deltas,
    setDeltas,
    confirmState,
    setConfirmState,
    selectedProducts,
    setSelectedProducts,
    isApplying,
    tableData,
    defaultExpanded,
    alertCount,
    pendingCount,
    handleApply,
    executeDelete,
    stockLabel,
    confirmTitle,
    confirmMessage,
    confirmIsLoading,
  };
}
