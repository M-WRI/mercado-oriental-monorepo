import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { usePut } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { getOrders, updateOrderStatus } from "../api";
import {
  CANCELABLE_ORDER_STATUSES,
  NEXT_ORDER_STATUS,
} from "../utils";
import type { IOrderDetailResponse, OrderStatus } from "../types";

export function useOrderStatusActions(
  orderId: string | undefined,
  order: IOrderDetailResponse | undefined,
  shopId: string,
  onInvalidate: () => void
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { mutate: patchStatus, isPending: isAdvancing } = usePut();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showShipForm, setShowShipForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  const invalidateOrders = () => {
    onInvalidate();
    queryClient.invalidateQueries({ queryKey: getOrders.queryKey(shopId) });
  };

  const advanceStatus = (status: OrderStatus, extra?: Record<string, string>) => {
    if (!orderId) return;
    patchStatus(
      { url: updateOrderStatus.url(orderId), data: { status, ...extra } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.statusUpdated"));
          invalidateOrders();
          setShowShipForm(false);
        },
      }
    );
  };

  const handleCancel = () => {
    if (!orderId) return;
    patchStatus(
      { url: updateOrderStatus.url(orderId), data: { status: "cancelled", cancelReason } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.orderCancelled"));
          invalidateOrders();
          setShowCancel(false);
          setCancelReason("");
        },
      }
    );
  };

  const next = order ? NEXT_ORDER_STATUS[order.status] : undefined;
  const canCancel = order ? CANCELABLE_ORDER_STATUSES.includes(order.status) : false;
  const needsShipForm = next === "shipped";

  return {
    next,
    canCancel,
    needsShipForm,
    isAdvancing,
    showCancel,
    setShowCancel,
    cancelReason,
    setCancelReason,
    showShipForm,
    setShowShipForm,
    trackingNumber,
    setTrackingNumber,
    carrier,
    setCarrier,
    advanceStatus,
    handleCancel,
  };
}
