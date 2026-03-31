import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader } from "@mercado/shared-ui/components/card";
import type { ITopProduct } from "../../types";

interface TopProductsProps {
  products: ITopProduct[];
}

export const TopProducts = ({ products }: TopProductsProps) => {
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <Card padding="lg" className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-400">{t("dashboard.noSalesData")}</p>
      </Card>
    );
  }

  const chartData = products.map((p) => ({
    name: p.name.length > 18 ? p.name.slice(0, 18) + "..." : p.name,
    revenue: p.revenue,
    unitsSold: p.unitsSold,
  }));

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <CardHeader title={t("dashboard.topProducts")} />

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 11, fill: "#4b5563" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) => {
                const n = typeof value === "number" ? value : Number(value);
                const nm = String(name);
                return [
                  nm === "revenue" ? `€${n.toFixed(2)}` : `${n} ${t("common.unit_plural")}`,
                  nm === "revenue" ? t("dashboard.revenue") : t("common.sold"),
                ];
              }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="revenue" fill="#111827" radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
