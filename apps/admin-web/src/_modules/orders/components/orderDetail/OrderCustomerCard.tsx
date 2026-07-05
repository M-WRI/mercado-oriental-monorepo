import { useTranslation } from "react-i18next";
import { Card } from "@mercado/shared-ui";

type OrderCustomerCardProps = {
  customerName: string | null;
  customerEmail: string;
};

export function OrderCustomerCard({ customerName, customerEmail }: OrderCustomerCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <h5 className="text-sm font-medium text-gray-700 mb-3">{t("orders.customerInfo")}</h5>
      <div className="space-y-2">
        {customerName && <p className="text-sm text-gray-900">{customerName}</p>}
        <p className="text-sm text-gray-500">{customerEmail}</p>
      </div>
    </Card>
  );
}
