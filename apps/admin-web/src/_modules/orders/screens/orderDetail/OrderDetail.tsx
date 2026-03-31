import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePatch, usePost } from "@/_shared/queryProvider";
import { Button, Tag, Card, useToast, QueryError } from "@mercado/shared-ui";
import { getDashboard } from "@/_modules/dashboard/api";
import { getNotifications } from "@/_modules/notifications/api";
import { getProducts } from "@/_modules/products/api";
import { getOrder, getOrders, updateOrderStatus, updateOrder, restockOrder } from "../../api";
import { formatCurrency } from "@mercado/shared-ui";
import type { IOrderDetailResponse, OrderStatus } from "../../types";
import { StatusTimeline } from "./StatusTimeline";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderMessages } from "./OrderMessages";
import { OrderDisputes } from "./OrderDisputes";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "packed",
  packed: "shipped",
  shipped: "delivered",
};

const CANCELABLE: OrderStatus[] = ["pending", "confirmed", "packed"];

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: order, isLoading, isError, refetch } = useFetch<IOrderDetailResponse>({
    queryKey: getOrder.queryKey(id),
    url: getOrder.url(id),
  });

  const { mutate: patchStatus, isPending: isAdvancing } = usePatch();
  const { mutate: patchOrder, isPending: isUpdating } = usePatch();
  const { mutate: postRestock, isPending: isRestocking } = usePost<
    { items: { orderItemId: string; quantity: number }[] },
    unknown
  >();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showShipForm, setShowShipForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [restockQty, setRestockQty] = useState<Record<string, string>>({});

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getOrder.queryKey(id) });
    queryClient.invalidateQueries({ queryKey: getOrders.queryKey });
  };

  const invalidateAfterRestock = () => {
    invalidate();
    queryClient.invalidateQueries({ queryKey: getProducts.queryKey });
    queryClient.invalidateQueries({ queryKey: getDashboard.queryKey });
    queryClient.invalidateQueries({ queryKey: getNotifications.queryKey });
  };

  const advanceStatus = (status: OrderStatus, extra?: Record<string, string>) => {
    if (!id) return;
    patchStatus(
      { url: updateOrderStatus.url(id), data: { status, ...extra } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.statusUpdated"));
          invalidate();
          setShowShipForm(false);
        },
      }
    );
  };

  const handleCancel = () => {
    if (!id) return;
    patchStatus(
      { url: updateOrderStatus.url(id), data: { status: "cancelled", cancelReason } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.orderCancelled"));
          invalidate();
          setShowCancel(false);
          setCancelReason("");
        },
      }
    );
  };

  const saveNote = () => {
    if (!id) return;
    patchOrder(
      { url: updateOrder.url(id), data: { internalNote } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.noteUpdated"));
          invalidate();
          setEditingNote(false);
        },
      }
    );
  };

  const submitRestock = () => {
    if (!id || !order) return;
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
      { url: restockOrder.url(id), data: { items } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.restockSuccess"));
          setRestockQty({});
          invalidateAfterRestock();
        },
      }
    );
  };

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

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("orders.notFound")}</p>
      </div>
    );
  }

  const next = NEXT_STATUS[order.status];
  const canCancel = CANCELABLE.includes(order.status);
  const needsShipForm = next === "shipped";

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      {/* Breadcrumb */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Button onClick={() => navigate("/orders")} style="link" className="!text-xs !p-0">
            {t("orders.title")}
          </Button>
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs text-gray-400">{order.shop.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {t("orders.orderNumber", { id: order.id.slice(0, 8) })}
            </h4>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {next && !needsShipForm && (
              <Button
                onClick={() => advanceStatus(next)}
                disabled={isAdvancing}
              >
                {t(`orders.actions.${next}`)}
              </Button>
            )}
            {next && needsShipForm && (
              <Button onClick={() => setShowShipForm(true)} disabled={isAdvancing}>
                {t("orders.actions.shipped")}
              </Button>
            )}
            {canCancel && (
              <Button onClick={() => setShowCancel(true)} style="danger">
                {t("orders.actions.cancel")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Status timeline */}
          <StatusTimeline order={order} />

          {/* Line items */}
          <Card>
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              {t("orders.lineItems")} ({order.items.length})
            </h5>
            <OrderItemsTable items={order.items} />
            <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{t("orders.total")}</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </Card>

          {/* Messages */}
          <OrderMessages orderId={order.id} />

          {/* Disputes */}
          <OrderDisputes orderId={order.id} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Customer */}
          <Card>
            <h5 className="text-sm font-medium text-gray-700 mb-3">{t("orders.customerInfo")}</h5>
            <div className="space-y-2">
              {order.customerName && (
                <p className="text-sm text-gray-900">{order.customerName}</p>
              )}
              <p className="text-sm text-gray-500">{order.customerEmail}</p>
            </div>
          </Card>

          {/* Shipping */}
          <Card>
            <h5 className="text-sm font-medium text-gray-700 mb-3">{t("orders.shipping")}</h5>
            <div className="space-y-2">
              {order.shippingAddress ? (
                <p className="text-sm text-gray-600 whitespace-pre-line">{order.shippingAddress}</p>
              ) : (
                <p className="text-sm text-gray-400">{t("orders.noAddress")}</p>
              )}
              {order.trackingNumber && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("orders.tracking")}</p>
                  <p className="text-sm font-mono text-gray-900">{order.trackingNumber}</p>
                  {order.carrier && (
                    <Tag className="mt-1">{order.carrier}</Tag>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-700">{t("orders.notes")}</h5>
              {!editingNote && (
                <Button
                  onClick={() => {
                    setInternalNote(order.internalNote ?? "");
                    setEditingNote(true);
                  }}
                  style="link"
                  className="!text-xs"
                >
                  {t("common.edit")}
                </Button>
              )}
            </div>
            {order.customerNote && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("orders.customerNote")}</p>
                <p className="text-sm text-gray-600 bg-amber-50 rounded px-2 py-1.5">{order.customerNote}</p>
              </div>
            )}
            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  rows={3}
                  placeholder={t("orders.notePlaceholder")}
                />
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setEditingNote(false)} style="primaryOutline">
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={saveNote} disabled={isUpdating}>
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            ) : order.internalNote ? (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("orders.internalNote")}</p>
                <p className="text-sm text-gray-600">{order.internalNote}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t("orders.noNotes")}</p>
            )}
          </Card>

          {/* Cancel reason */}
          {order.status === "cancelled" && order.cancelReason && (
            <Card>
              <h5 className="text-sm font-medium text-red-600 mb-2">{t("orders.cancelReason")}</h5>
              <p className="text-sm text-gray-600">{order.cancelReason}</p>
            </Card>
          )}

          {/* Returns / restock (delivered orders) */}
          {order.status === "delivered" && (
            <Card>
              <h5 className="text-sm font-medium text-gray-700 mb-1">{t("orders.restockTitle")}</h5>
              <p className="text-xs text-gray-500 mb-3">{t("orders.restockHint")}</p>
              <div className="space-y-2">
                {order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-gray-700 truncate min-w-0">
                      {it.productName}
                      <span className="text-gray-400"> · max {it.quantity}</span>
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={it.quantity}
                      className="w-16 rounded border border-gray-200 px-2 py-1 text-sm text-right"
                      placeholder="0"
                      value={restockQty[it.id] ?? ""}
                      onChange={(e) =>
                        setRestockQty((prev) => ({ ...prev, [it.id]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <Button onClick={submitRestock} disabled={isRestocking}>
                  {isRestocking ? t("common.loading") : t("orders.restockSubmit")}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Ship modal */}
      {showShipForm && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShipForm(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <h5 className="text-base font-semibold text-gray-900 mb-1">{t("orders.shipOrder")}</h5>
              <p className="text-sm text-gray-500 mb-4">{t("orders.shipOrderHint")}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("orders.trackingNumber")} *</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                    placeholder="e.g. DHL123456789"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("orders.carrier")}</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                    placeholder="e.g. DHL, FedEx, UPS"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4">
              <Button onClick={() => setShowShipForm(false)} style="primaryOutline">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() =>
                  advanceStatus("shipped", {
                    trackingNumber,
                    ...(carrier ? { carrier } : {}),
                  })
                }
                disabled={!trackingNumber.trim() || isAdvancing}
              >
                {isAdvancing ? t("common.loading") : t("orders.actions.shipped")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm */}
      {showCancel && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCancel(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <h5 className="text-base font-semibold text-gray-900 mb-1">{t("orders.cancelOrder")}</h5>
              <p className="text-sm text-gray-500 mb-4">{t("orders.cancelConfirmMessage")}</p>
              <div>
                <label className="text-sm font-medium text-gray-700">{t("orders.cancelReasonLabel")}</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                  rows={3}
                  placeholder={t("orders.cancelReasonPlaceholder")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4">
              <Button onClick={() => setShowCancel(false)} style="primaryOutline">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleCancel}
                style="danger"
                disabled={isAdvancing}
                className="!bg-red-600 !text-white hover:!bg-red-700"
              >
                {isAdvancing ? t("common.loading") : t("orders.actions.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
