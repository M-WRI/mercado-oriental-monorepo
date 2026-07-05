import { useTranslation } from "react-i18next";
import { Card, Tag } from "@mercado/shared-ui";

type OrderShippingCardProps = {
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
};

export function OrderShippingCard({
  shippingAddress,
  trackingNumber,
  carrier,
}: OrderShippingCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <h5 className="text-sm font-medium text-gray-700 mb-3">{t("orders.shipping")}</h5>
      <div className="space-y-2">
        {shippingAddress ? (
          <p className="text-sm text-gray-600 whitespace-pre-line">{shippingAddress}</p>
        ) : (
          <p className="text-sm text-gray-400">{t("orders.noAddress")}</p>
        )}
        {trackingNumber && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {t("orders.tracking")}
            </p>
            <p className="text-sm font-mono text-gray-900">{trackingNumber}</p>
            {carrier && <Tag className="mt-1">{carrier}</Tag>}
          </div>
        )}
      </div>
    </Card>
  );
}
