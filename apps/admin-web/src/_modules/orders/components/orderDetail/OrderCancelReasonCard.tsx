import { useTranslation } from "react-i18next";
import { Card } from "@mercado/shared-ui";

type OrderCancelReasonCardProps = {
  cancelReason: string;
};

export function OrderCancelReasonCard({ cancelReason }: OrderCancelReasonCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <h5 className="text-sm font-medium text-red-600 mb-2">{t("orders.cancelReason")}</h5>
      <p className="text-sm text-gray-600">{cancelReason}</p>
    </Card>
  );
}
