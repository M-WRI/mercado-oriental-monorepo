import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { QueryError } from "@mercado/shared-ui";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import { getOrder } from "../api";
import {
  CancelOrderModal,
  OrderCancelReasonCard,
  OrderCustomerCard,
  OrderDetailHeader,
  OrderDisputes,
  OrderLineItemsCard,
  OrderMessages,
  OrderNotesCard,
  OrderRestockCard,
  OrderShippingCard,
  ShipOrderModal,
  StatusTimeline,
} from "../components";
import {
  useOrderDetail,
  useOrderNoteEditor,
  useOrderRestock,
  useOrderStatusActions,
} from "../hooks";

export const OrderDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { shopId, paths } = useShop();

  const { orderId, order, isLoading, isError, refetch } = useOrderDetail();

  const invalidateOrder = () => {
    queryClient.invalidateQueries({ queryKey: getOrder.queryKey(orderId) });
  };

  const status = useOrderStatusActions(orderId, order, shopId, invalidateOrder);
  const note = useOrderNoteEditor(orderId, order?.internalNote, invalidateOrder);
  const restock = useOrderRestock(orderId, order, shopId, invalidateOrder);

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

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      <OrderDetailHeader
        order={order}
        onNavigateBack={() => navigate(paths.orders)}
        next={status.next}
        needsShipForm={status.needsShipForm}
        canCancel={status.canCancel}
        isAdvancing={status.isAdvancing}
        onAdvance={status.advanceStatus}
        onOpenShipForm={() => status.setShowShipForm(true)}
        onOpenCancel={() => status.setShowCancel(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <StatusTimeline order={order} />
          <OrderLineItemsCard items={order.items} totalAmount={order.totalAmount} />
          <OrderMessages orderId={order.id} />
          <OrderDisputes orderId={order.id} />
        </div>

        <div className="flex flex-col gap-4">
          <OrderCustomerCard
            customerName={order.customerName}
            customerEmail={order.customerEmail}
          />
          <OrderShippingCard
            shippingAddress={order.shippingAddress}
            trackingNumber={order.trackingNumber}
            carrier={order.carrier}
          />
          <OrderNotesCard
            customerNote={order.customerNote}
            internalNote={order.internalNote}
            editingNote={note.editingNote}
            draftNote={note.internalNote}
            isUpdating={note.isUpdating}
            onStartEditing={note.startEditing}
            onCancelEditing={note.cancelEditing}
            onDraftChange={note.setInternalNote}
            onSave={note.saveNote}
          />
          {order.status === "cancelled" && order.cancelReason && (
            <OrderCancelReasonCard cancelReason={order.cancelReason} />
          )}
          {order.status === "delivered" && (
            <OrderRestockCard
              items={order.items}
              restockQty={restock.restockQty}
              isRestocking={restock.isRestocking}
              onQtyChange={restock.updateRestockQty}
              onSubmit={restock.submitRestock}
            />
          )}
        </div>
      </div>

      {status.showShipForm && (
        <ShipOrderModal
          trackingNumber={status.trackingNumber}
          carrier={status.carrier}
          isAdvancing={status.isAdvancing}
          onTrackingNumberChange={status.setTrackingNumber}
          onCarrierChange={status.setCarrier}
          onClose={() => status.setShowShipForm(false)}
          onSubmit={() =>
            status.advanceStatus("shipped", {
              trackingNumber: status.trackingNumber,
              ...(status.carrier ? { carrier: status.carrier } : {}),
            })
          }
        />
      )}

      {status.showCancel && (
        <CancelOrderModal
          cancelReason={status.cancelReason}
          isAdvancing={status.isAdvancing}
          onCancelReasonChange={status.setCancelReason}
          onClose={() => status.setShowCancel(false)}
          onConfirm={status.handleCancel}
        />
      )}
    </div>
  );
};
