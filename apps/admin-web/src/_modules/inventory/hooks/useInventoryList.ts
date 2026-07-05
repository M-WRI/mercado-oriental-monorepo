import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { usePost } from "@/_shared/queryProvider";
import { useListQuery } from "@/_shared/hooks";
import { useToast } from "@mercado/shared-ui";
import { getProducts } from "@/_modules/products/api";
import { bulkAdjustInventory } from "../api";
import { getNotifications } from "@/_modules/notifications/api";
import { getDashboard } from "@/_modules/dashboard/api";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import type { FilterConfig } from "@mercado/shared-ui";
import type { IProductListItem, IVariant, TableRow } from "@/_modules/products/hooks/useProductList";

export function useInventoryList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { shopId, paths } = useShop();

  const [deltas, setDeltas] = useState<Record<string, string>>({});
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [historyVariant, setHistoryVariant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        type: "search",
        placeholder: t("filters.searchProducts"),
      },
      {
        type: "sort",
        options: [
          { value: "name", label: t("filters.sortName") },
          { value: "createdAt", label: t("filters.sortDate") },
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
    setSorting,
    setPage,
    setPageSize,
  } = useListQuery<IProductListItem>({
    queryKey: getProducts.queryKey(shopId),
    url: getProducts.url,
    staticFilters: { shopId },
  });

  const { mutate: postBulk, isPending: isApplying } = usePost();

  const filteredProducts = useMemo(() => {
    if (!alertsOnly) return products;
    return products.filter((p) => p.variants.some((v) => v.isLow || v.isOut));
  }, [products, alertsOnly]);

  const tableData: TableRow[] = useMemo(
    () =>
      filteredProducts.map((product) => ({
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
    [filteredProducts]
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

  const stats = useMemo(() => {
    let variantCount = 0;
    let totalAvailable = 0;
    let alertCount = 0;

    for (const product of products) {
      for (const variant of product.variants) {
        variantCount += 1;
        totalAvailable += variant.availableStock;
        if (variant.isLow || variant.isOut) alertCount += 1;
      }
    }

    return { productCount: products.length, variantCount, totalAvailable, alertCount };
  }, [products]);

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
          toastSuccess(t("inventory.bulkSuccess", { count: items.length }));
          invalidateQueries();
        },
      }
    );
  };

  const stockLabel = (variant: IVariant) => {
    if (variant.isOut) return { label: t("products.outOfStock"), variant: "danger" as const };
    if (variant.isLow) return { label: t("products.lowStock"), variant: "warning" as const };
    return { label: t("products.inStock"), variant: "success" as const };
  };

  return {
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
    isLoading,
    isError,
    refetch,
    filteredCount: filteredProducts.length,
  };
}
