import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Card, CardHeader } from "@mercado/shared-ui/components/card";
import { Tag } from "@mercado/shared-ui/components/tag";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import type { IInventoryAlerts } from "../../types";

interface InventoryAlertsProps {
  alerts: IInventoryAlerts;
}

export const InventoryAlerts = ({ alerts }: InventoryAlertsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { paths } = useShop();
  const { alertVariants, outOfStockCount, lowStockCount } = alerts;

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <CardHeader title={t("dashboard.inventoryAlerts")} />

      <div className="flex gap-2 mb-4">
        {outOfStockCount > 0 && (
          <Tag variant="danger" dot>
            {outOfStockCount} {t("dashboard.outOfStock")}
          </Tag>
        )}
        {lowStockCount > 0 && (
          <Tag variant="warning" dot>
            {lowStockCount} {t("dashboard.lowStock")}
          </Tag>
        )}
        {outOfStockCount === 0 && lowStockCount === 0 && (
          <Tag variant="success" dot>
            {t("dashboard.allStocked")}
          </Tag>
        )}
      </div>

      {alertVariants.length > 0 ? (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {alertVariants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => navigate(paths.product(v.productId))}
              className="w-full flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-left rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                <p className="text-xs text-gray-400 truncate">{v.productName}</p>
              </div>
              <Tag
                variant={(v.available ?? v.stock) === 0 ? "danger" : "warning"}
              >
                {(v.available ?? v.stock) === 0
                  ? t("products.outOfStock")
                  : `${v.available ?? v.stock} ${t("common.left")}`}
              </Tag>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">{t("dashboard.noAlerts")}</p>
        </div>
      )}
    </Card>
  );
};
