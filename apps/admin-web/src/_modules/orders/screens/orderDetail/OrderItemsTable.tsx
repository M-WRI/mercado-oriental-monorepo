import { useTranslation } from "react-i18next";
import { formatCurrency } from "@mercado/shared-ui";
import type { IOrderItem } from "../../types";

export const OrderItemsTable = ({ items }: { items: IOrderItem[] }) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t("orders.itemColumns.product")}
            </th>
            <th className="text-right py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t("orders.itemColumns.qty")}
            </th>
            <th className="text-right py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t("orders.itemColumns.unitPrice")}
            </th>
            <th className="text-right py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t("orders.itemColumns.lineTotal")}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-50">
              <td className="py-2.5">
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-400">{item.variantName}</p>
                {item.attributeSummary && (
                  <p className="text-xs text-gray-400">{item.attributeSummary}</p>
                )}
              </td>
              <td className="text-right py-2.5 text-gray-700">{item.quantity}</td>
              <td className="text-right py-2.5 text-gray-700">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right py-2.5 font-medium text-gray-900">{formatCurrency(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
