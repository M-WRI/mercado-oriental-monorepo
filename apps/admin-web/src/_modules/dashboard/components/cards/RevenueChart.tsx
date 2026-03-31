import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader } from "@mercado/shared-ui/components/card";
import { useTab } from "@mercado/shared-ui";
import { formatCurrency } from "@mercado/shared-ui";
import type { IRevenueTimelineEntry } from "../../types";

interface RevenueChartProps {
  data: IRevenueTimelineEntry[];
  thisWeekRevenue: number;
  prevWeekRevenue: number;
}

type ViewMode = "revenue" | "orders";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export const RevenueChart = ({ data, thisWeekRevenue, prevWeekRevenue }: RevenueChartProps) => {
  const { t } = useTranslation();

  const { active: viewMode, Tabs } = useTab<ViewMode>({
    tabs: [
      { value: "revenue", label: t("dashboard.revenue") },
      { value: "orders", label: t("dashboard.orders") },
    ],
  });

  if (data.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center" padding="lg">
        <p className="text-sm text-gray-400">{t("common.noData")}</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <CardHeader title={t("dashboard.revenueOverTime")} action={<Tabs />} />

      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
            </defs>
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
                  ? [`€${n.toFixed(2)}`, t("dashboard.revenue")]
                  : [n, t("dashboard.orders")];
              }}
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            />
            <Area
              type="monotone"
              dataKey={viewMode}
              stroke="#111827"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly comparison */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex-1">
          <p className="text-xs text-gray-400">{t("common.thisWeek")}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">
            {formatCurrency(thisWeekRevenue)}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400">{t("common.lastWeek")}</p>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            {formatCurrency(prevWeekRevenue)}
          </p>
        </div>
      </div>
    </Card>
  );
};
