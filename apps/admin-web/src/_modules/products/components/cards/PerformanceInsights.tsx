import { useTranslation } from "react-i18next";
import { Card } from "@mercado/shared-ui/components/card";
import { Tag } from "@mercado/shared-ui/components/tag";
import { formatCurrency } from "@mercado/shared-ui";

interface PerformanceInsightsProps {
  salesVelocity: number;
  avgSellingPrice: number;
  daysSinceLastSale: number | null;
  bestVariant: { name: string; revenue: number; sold: number } | null;
  worstVariant: { name: string; revenue: number; sold: number } | null;
  repeatBuyerCount: number;
  totalCustomers: number;
  topBuyer: { name: string | null; email: string; totalSpent: number } | null;
}

const StatRow = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-sm font-semibold text-gray-900 ${className}`}>{value}</span>
  </div>
);

export const PerformanceInsights = ({
  salesVelocity,
  avgSellingPrice,
  daysSinceLastSale,
  bestVariant,
  worstVariant,
  repeatBuyerCount,
  totalCustomers,
  topBuyer,
}: PerformanceInsightsProps) => {
  const { t } = useTranslation();
  const repeatRate =
    totalCustomers > 0
      ? ((repeatBuyerCount / totalCustomers) * 100).toFixed(0)
      : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sales velocity */}
      <Card padding="lg">
        <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {t("products.performance.salesVelocity")}
        </h6>
        <div className="space-y-3">
          <StatRow label={t("products.performance.unitsPerDay")} value={salesVelocity.toFixed(1)} />
          <StatRow label={t("products.performance.unitsPerWeek")} value={(salesVelocity * 7).toFixed(1)} />
          <StatRow label={t("products.performance.avgPrice")} value={formatCurrency(avgSellingPrice)} />
          <StatRow
            label={t("products.performance.lastSale")}
            value={daysSinceLastSale !== null ? t("common.daysAgo", { count: daysSinceLastSale }) : "—"}
            className={daysSinceLastSale !== null && daysSinceLastSale > 14 ? "!text-amber-500" : ""}
          />
        </div>
      </Card>

      {/* Best / worst variant */}
      <Card padding="lg">
        <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {t("products.performance.variantPerformance")}
        </h6>
        {bestVariant ? (
          <div className="space-y-4">
            <div>
              <Tag variant="success" dot className="mb-1">{t("products.performance.bestSeller")}</Tag>
              <p className="text-sm font-medium text-gray-900 truncate">{bestVariant.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {bestVariant.sold} {t("common.sold")} · {formatCurrency(bestVariant.revenue)}
              </p>
            </div>
            {worstVariant && worstVariant.name !== bestVariant.name && (
              <div>
                <Tag variant="danger" dot className="mb-1">{t("products.performance.lowestSeller")}</Tag>
                <p className="text-sm font-medium text-gray-900 truncate">{worstVariant.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {worstVariant.sold} {t("common.sold")} · {formatCurrency(worstVariant.revenue)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">{t("products.performance.noSalesYet")}</p>
        )}
      </Card>

      {/* Customer insights */}
      <Card padding="lg">
        <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {t("products.performance.customerInsights")}
        </h6>
        <div className="space-y-3">
          <StatRow label={t("products.performance.totalCustomers")} value={String(totalCustomers)} />
          <StatRow label={t("products.performance.repeatBuyers")} value={String(repeatBuyerCount)} />
          <StatRow label={t("products.performance.repeatRate")} value={`${repeatRate}%`} />
          {topBuyer && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{t("products.performance.topBuyer")}</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {topBuyer.name || topBuyer.email}
              </p>
              <p className="text-xs text-gray-500">{formatCurrency(topBuyer.totalSpent)} {t("products.performance.spent")}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
