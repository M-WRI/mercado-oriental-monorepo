import { useTranslation } from "react-i18next";
import { Card } from "@mercado/shared-ui/components/card";
import { Tag } from "@mercado/shared-ui/components/tag";
import type { ICustomerStats } from "../../types";

interface CustomerOverviewProps {
  stats: ICustomerStats;
}

const StatRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

export const CustomerOverview = ({ stats }: CustomerOverviewProps) => {
  const { t } = useTranslation();

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
        {t("dashboard.customers")}
      </h6>

      <div className="space-y-3">
        <StatRow label={t("dashboard.totalCustomers")} value={stats.totalCustomers} />
        <StatRow label={t("dashboard.repeatBuyers")} value={stats.repeatBuyerCount} />
        <StatRow label={t("dashboard.repeatRate")} value={`${stats.repeatRate}%`} />
        <StatRow label={t("dashboard.newThisWeek")} value={stats.newCustomersThisWeek} />
      </div>

      {stats.repeatBuyerCount > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Tag variant="success" dot>
            {stats.repeatBuyerCount} {stats.repeatBuyerCount !== 1 ? t("dashboard.repeatBuyer_plural") : t("dashboard.repeatBuyer")}
          </Tag>
        </div>
      )}
    </Card>
  );
};
