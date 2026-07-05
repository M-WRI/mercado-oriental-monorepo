import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useFetch } from "@/_shared/queryProvider";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import { getShopDisputes } from "@/_modules/touchpoints/api";
import type { DisputeStatus, IDispute } from "@/_modules/touchpoints/types";

export function useDisputesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shopId, paths } = useShop();
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "">("");

  const { data: disputes = [], isLoading, isError, refetch } = useFetch<IDispute[]>({
    queryKey: getShopDisputes.queryKey(shopId, statusFilter || undefined),
    url: getShopDisputes.url(shopId, statusFilter || undefined),
  });

  const openCount = useMemo(
    () => disputes.filter((d) => d.status === "open" || d.status === "under_review").length,
    [disputes]
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("filters.all") },
      { value: "open", label: t("touchpoints.status.open") },
      { value: "under_review", label: t("touchpoints.status.under_review") },
      { value: "resolved", label: t("touchpoints.status.resolved") },
      { value: "closed", label: t("touchpoints.status.closed") },
    ],
    [t]
  );

  const goToOrder = (orderId: string) => navigate(paths.order(orderId));

  return {
    t,
    disputes,
    openCount,
    statusFilter,
    setStatusFilter,
    statusOptions,
    isLoading,
    isError,
    refetch,
    goToOrder,
  };
}
