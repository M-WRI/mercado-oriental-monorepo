import { useTranslation } from "react-i18next";
import { Card, CardStat, ChangeIndicator } from "@mercado/shared-ui/components/card";
import { formatCurrency } from "@mercado/shared-ui";
import type { IProductAnalytics } from "../../types";

interface OverviewCardsProps {
  analytics: IProductAnalytics;
  variantCount: number;
}

export const OverviewCards = ({ analytics: a, variantCount }: OverviewCardsProps) => {
  const { t } = useTranslation();

  const cards = [
    {
      label: t("products.overview.totalRevenue"),
      value: formatCurrency(a.totalRevenue),
      change: a.revenueChangePercent,
      sub: t("common.vsLastWeek"),
    },
    {
      label: t("products.overview.unitsSold"),
      value: a.totalSold.toLocaleString(),
      change: a.unitsChangePercent,
      sub: t("common.vsLastWeek"),
    },
    {
      label: t("products.overview.availableStock"),
      value: a.totalStock.toLocaleString(),
      change: null,
      sub:
        a.totalReserved != null && a.totalReserved > 0
          ? `${formatCurrency(a.totalStockValue)} ${t("common.value")} · ${t("products.overview.reservedNote", { count: a.totalReserved })}`
          : `${formatCurrency(a.totalStockValue)} ${t("common.value")}`,
    },
    {
      label: t("products.overview.avgSellingPrice"),
      value: formatCurrency(a.avgSellingPrice),
      change: null,
      sub: `${variantCount} ${variantCount !== 1 ? t("common.variant_plural") : t("common.variant")}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardStat
            label={c.label}
            value={c.value}
            sub={c.sub}
            change={c.change !== null ? <ChangeIndicator value={c.change} /> : undefined}
          />
        </Card>
      ))}
    </div>
  );
};
