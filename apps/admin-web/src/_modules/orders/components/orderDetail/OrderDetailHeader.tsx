import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { formatOrderDateTime } from "../../utils";
import type { IOrderDetailResponse, OrderStatus } from "../../types";

type OrderDetailHeaderProps = {
  order: IOrderDetailResponse;
  onNavigateBack: () => void;
  next?: OrderStatus;
  needsShipForm: boolean;
  canCancel: boolean;
  isAdvancing: boolean;
  onAdvance: (status: OrderStatus) => void;
  onOpenShipForm: () => void;
  onOpenCancel: () => void;
};

export function OrderDetailHeader({
  order,
  onNavigateBack,
  next,
  needsShipForm,
  canCancel,
  isAdvancing,
  onAdvance,
  onOpenShipForm,
  onOpenCancel,
}: OrderDetailHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="shrink-0 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Button onClick={onNavigateBack} style="link" className="!text-xs !p-0">
          {t("orders.title")}
        </Button>
        <span className="text-xs text-gray-300">/</span>
        <span className="text-xs text-gray-400">{order.shop.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            {t("orders.orderNumber", { id: order.id.slice(0, 8) })}
          </h4>
          <p className="text-sm text-gray-500 mt-0.5">{formatOrderDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          {next && !needsShipForm && (
            <Button onClick={() => onAdvance(next)} disabled={isAdvancing}>
              {t(`orders.actions.${next}`)}
            </Button>
          )}
          {next && needsShipForm && (
            <Button onClick={onOpenShipForm} disabled={isAdvancing}>
              {t("orders.actions.shipped")}
            </Button>
          )}
          {canCancel && (
            <Button onClick={onOpenCancel} style="danger">
              {t("orders.actions.cancel")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
