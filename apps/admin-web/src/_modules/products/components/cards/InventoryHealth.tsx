import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardHeader } from "@mercado/shared-ui/components/card";
import { Tag } from "@mercado/shared-ui/components/tag";
import { formatCurrencyRound } from "@mercado/shared-ui";
import { availableUnits, stockHealthLevel } from "@mercado/shared-ui/utils/stock";
import type { IVariantStat } from "../../types";

interface InventoryHealthProps {
  totalStock: number;
  totalStockOnHand?: number;
  totalReserved?: number;
  totalStockValue: number;
  outOfStockCount: number;
  lowStockCount: number;
  lowStockThreshold: number;
  variants: IVariantStat[];
}

const barFill = (level: ReturnType<typeof stockHealthLevel>) => {
  if (level === "out") return "#f87171";
  if (level === "low") return "#fbbf24";
  return "#111827";
};

export const InventoryHealth = ({
  totalStock,
  totalStockOnHand,
  totalReserved,
  totalStockValue,
  outOfStockCount,
  lowStockCount,
  lowStockThreshold,
  variants,
}: InventoryHealthProps) => {
  const { t } = useTranslation();

  const enriched = variants.map((v) => {
    const reserved = v.reservedStock ?? 0;
    const available =
      v.availableStock ?? availableUnits(v.stock, reserved);
    const threshold = v.lowStockThreshold ?? lowStockThreshold;
    return { ...v, available, threshold };
  });

  const sortedVariants = [...enriched].sort((a, b) => a.available - b.available);
  const alertVariants = sortedVariants.filter(
    (v) => stockHealthLevel(v.available, v.threshold) !== "ok"
  );
  const chartSource =
    alertVariants.length > 0 ? alertVariants : sortedVariants.slice(0, 8);
  const chartData = chartSource.map((v) => ({
    name: v.name,
    available: v.available,
    level: stockHealthLevel(v.available, v.threshold),
  }));

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <CardHeader title={t("products.inventory.inventoryHealth")} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400">
            {t("products.inventory.availableUnits")}
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-0.5">
            {totalStock.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400">
            {t("products.inventory.stockValue")}
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-0.5">
            {formatCurrencyRound(totalStockValue)}
          </p>
        </div>
      </div>

      {(totalStockOnHand !== undefined || (totalReserved ?? 0) > 0) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
          {totalStockOnHand !== undefined && (
            <span>
              {t("products.inventory.onHand")}:{" "}
              <span className="text-gray-700">{totalStockOnHand}</span>
            </span>
          )}
          {(totalReserved ?? 0) > 0 && (
            <span>
              {t("products.inventory.reserved")}:{" "}
              <span className="text-gray-700">{totalReserved}</span>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {outOfStockCount > 0 && (
          <Tag variant="danger" dot>
            {outOfStockCount} {t("products.inventory.outOfStock")}
          </Tag>
        )}
        {lowStockCount > 0 && (
          <Tag variant="warning" dot>
            {lowStockCount} {t("products.inventory.lowStock")}
          </Tag>
        )}
        {outOfStockCount === 0 && lowStockCount === 0 && (
          <Tag variant="success" dot>{t("products.inventory.allStocked")}</Tag>
        )}
      </div>

      <div className="flex-1 min-h-[160px]">
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
              width={100}
              tick={{ fontSize: 11, fill: "#4b5563" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [
                `${typeof value === "number" ? value : Number(value)} ${t("products.inventory.availableShort")}`,
                t("products.variantsTable.available"),
              ]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="available" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={barFill(entry.level)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
