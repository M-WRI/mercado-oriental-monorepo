import { useTranslation } from "react-i18next";
import { Button, Card } from "@mercado/shared-ui";
import type { IOrderItem } from "../../types";

type OrderRestockCardProps = {
  items: IOrderItem[];
  restockQty: Record<string, string>;
  isRestocking: boolean;
  onQtyChange: (itemId: string, value: string) => void;
  onSubmit: () => void;
};

export function OrderRestockCard({
  items,
  restockQty,
  isRestocking,
  onQtyChange,
  onSubmit,
}: OrderRestockCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <h5 className="text-sm font-medium text-gray-700 mb-1">{t("orders.restockTitle")}</h5>
      <p className="text-xs text-gray-500 mb-3">{t("orders.restockHint")}</p>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-2 text-sm">
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
              onChange={(e) => onQtyChange(it.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button onClick={onSubmit} disabled={isRestocking}>
          {isRestocking ? t("common.loading") : t("orders.restockSubmit")}
        </Button>
      </div>
    </Card>
  );
}
