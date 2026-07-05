import { useTranslation } from "react-i18next";
import { Card, formatCurrency } from "@mercado/shared-ui";
import { OrderItemsTable } from "./OrderItemsTable";
import type { IOrderItem } from "../../types";

type OrderLineItemsCardProps = {
  items: IOrderItem[];
  totalAmount: number;
};

export function OrderLineItemsCard({ items, totalAmount }: OrderLineItemsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <h5 className="text-sm font-medium text-gray-700 mb-3">
        {t("orders.lineItems")} ({items.length})
      </h5>
      <OrderItemsTable items={items} />
      <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider">{t("orders.total")}</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
        </div>
      </div>
    </Card>
  );
}
