import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader } from "@mercado/shared-ui/components/card";
import { useTab } from "@mercado/shared-ui";
import { formatCurrency } from "@mercado/shared-ui";

interface SalesChartProps {
  data: { date: string; units: number; revenue: number }[];
  thisWeek: { revenue: number; units: number };
  lastWeek: { revenue: number; units: number };
}

type ViewMode = "units" | "revenue";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export const SalesChart = ({ data, thisWeek, lastWeek }: SalesChartProps) => {
  const { t } = useTranslation();

  const { active: viewMode, Tabs } = useTab<ViewMode>({
    tabs: [
      { value: "units", label: t("products.sales.units") },
      { value: "revenue", label: t("products.sales.revenue") },
    ],
  });

  if (data.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center" padding="lg">
        <p className="text-sm text-gray-400">{t("products.sales.noSalesData")}</p>
      </Card>
    );
  }

  const displayData = data.length > 30 ? data.slice(-30) : data;
  const totalUnits = data.reduce((s, d) => s + d.units, 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <CardHeader title={t("products.sales.salesOverTime")} action={<Tabs />} />
      <p className="text-xs text-gray-400 -mt-2 mb-4">
        {viewMode === "units"
          ? `${totalUnits.toLocaleString()} ${t("products.sales.totalUnits")}`
          : `${formatCurrency(totalRevenue)} ${t("common.total")}`}
      </p>

      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                viewMode === "revenue" ? `€${v}` : String(v)
              }
            />
            <Tooltip
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value);
                return viewMode === "revenue"
                  ? [`€${n.toFixed(2)}`, t("products.sales.revenue")]
                  : [n, t("products.sales.units")];
              }}
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            />
            <Bar
              dataKey={viewMode}
              fill="#111827"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly comparison */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex-1">
          <p className="text-xs text-gray-400">{t("common.thisWeek")}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">
            {thisWeek.units} {t("common.unit_plural")} · {formatCurrency(thisWeek.revenue)}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400">{t("common.lastWeek")}</p>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            {lastWeek.units} {t("common.unit_plural")} · {formatCurrency(lastWeek.revenue)}
          </p>
        </div>
      </div>
    </Card>
  );
};
