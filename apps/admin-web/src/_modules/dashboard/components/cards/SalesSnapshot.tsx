import { useTranslation } from "react-i18next";
import { Card, CardStat, ChangeIndicator } from "@mercado/shared-ui/components/card";
import { formatCurrency } from "@mercado/shared-ui";
import type { ISalesSnapshot, IDashboardTotals } from "../../types";

interface SalesSnapshotProps {
  snapshot: ISalesSnapshot;
  totals: IDashboardTotals;
  revenueChangePercent: number;
}

const pctChange = (current: number, previous: number) =>
  previous === 0 ? 0 : ((current - previous) / previous) * 100;

export const SalesSnapshot = ({ snapshot, totals, revenueChangePercent }: SalesSnapshotProps) => {
  const { t } = useTranslation();

  const cards = [
    {
      label: t("dashboard.todayRevenue"),
      value: formatCurrency(snapshot.todayRevenue),
      change: pctChange(snapshot.todayRevenue, snapshot.yesterdayRevenue),
      sub: t("dashboard.yesterday", { amount: formatCurrency(snapshot.yesterdayRevenue) }),
    },
    {
      label: t("dashboard.todayOrders"),
      value: snapshot.todayOrders,
      change: pctChange(snapshot.todayOrders, snapshot.yesterdayOrders),
      sub: t("dashboard.unitsSold", { count: snapshot.todayUnits }),
    },
    {
      label: t("dashboard.totalRevenue"),
      value: formatCurrency(totals.totalRevenue),
      change: revenueChangePercent,
      changeSuffix: t("common.thisWeek").toLowerCase(),
      sub: t("dashboard.ordersTotal", { count: totals.totalOrders }),
    },
    {
      label: t("dashboard.products"),
      value: totals.totalProducts,
      change: null,
      sub: t("dashboard.attributes", { count: totals.totalAttributes }),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} padding="lg">
          <CardStat
            label={c.label}
            value={c.value}
            sub={c.sub}
            change={
              c.change !== null && c.change !== 0 ? (
                <ChangeIndicator value={c.change} suffix={"changeSuffix" in c ? c.changeSuffix : undefined} />
              ) : undefined
            }
          />
        </Card>
      ))}
    </div>
  );
};
