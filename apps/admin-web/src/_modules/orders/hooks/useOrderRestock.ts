import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { getDashboard } from "@/_modules/dashboard/api";
import { getNotifications } from "@/_modules/notifications/api";
import { getProducts } from "@/_modules/products/api";
import { getOrders, restockOrder } from "../api";
import type { IOrderDetailResponse } from "../types";

export function useOrderRestock(
  orderId: string | undefined,
  order: IOrderDetailResponse | undefined,
  shopId: string,
  onInvalidate: () => void
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { mutate: postRestock, isPending: isRestocking } = usePost<
    { items: { orderItemId: string; quantity: number }[] },
    unknown
  >();

  const [restockQty, setRestockQty] = useState<Record<string, string>>({});

  const updateRestockQty = (itemId: string, value: string) => {
    setRestockQty((prev) => ({ ...prev, [itemId]: value }));
  };

  const submitRestock = () => {
    if (!orderId || !order) return;

    const items = order.items
      .map((it) => ({
        orderItemId: it.id,
        quantity: Math.min(
          it.quantity,
          Math.max(0, parseInt(restockQty[it.id] ?? "0", 10) || 0)
        ),
      }))
      .filter((x) => x.quantity > 0);

    if (items.length === 0) return;

    postRestock(
      { url: restockOrder.url(orderId), data: { items } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.restockSuccess"));
          setRestockQty({});
          onInvalidate();
          queryClient.invalidateQueries({ queryKey: getOrders.queryKey(shopId) });
          queryClient.invalidateQueries({ queryKey: getProducts.queryKey(shopId) });
          queryClient.invalidateQueries({ queryKey: getDashboard.queryKey(shopId) });
          queryClient.invalidateQueries({ queryKey: getNotifications.queryKey(shopId) });
        },
      }
    );
  };

  return { restockQty, updateRestockQty, submitRestock, isRestocking };
}
