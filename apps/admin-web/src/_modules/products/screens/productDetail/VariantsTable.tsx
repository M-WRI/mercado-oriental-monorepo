import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Table } from "@mercado/shared-ui/components/table";
import { Tag } from "@mercado/shared-ui/components/tag";
import { availableUnits, stockHealthLevel } from "@mercado/shared-ui/utils/stock";
import type { IVariantStat } from "../../types";

interface VariantsTableProps {
  variants: IVariantStat[];
}

const AvailableIndicator = ({
  available,
  threshold,
}: {
  available: number;
  threshold: number;
}) => {
  const level = stockHealthLevel(available, threshold);
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm ${
        level === "out"
          ? "text-red-500 font-medium"
          : level === "low"
            ? "text-amber-500 font-medium"
            : "text-gray-700"
      }`}
    >
      {(level === "out" || level === "low") && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            level === "out" ? "bg-red-500" : "bg-amber-400"
          }`}
        />
      )}
      {available}
    </span>
  );
};

export const VariantsTable = ({ variants }: VariantsTableProps) => {
  const { t } = useTranslation();

  const columns: ColumnDef<IVariantStat>[] = [
    {
      id: "name",
      header: t("products.variantsTable.variant"),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      id: "attributes",
      header: t("products.variantsTable.attributes"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.attributes.map((a, i) => (
            <Tag key={i}>
              {a.attributeName}: {a.value}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      id: "price",
      header: t("products.variantsTable.price"),
      cell: ({ row }) => `€${row.original.price.toFixed(2)}`,
      meta: { className: "text-right" },
    },
    {
      id: "available",
      header: t("products.variantsTable.available"),
      cell: ({ row }) => {
        const v = row.original;
        const reserved = v.reservedStock ?? 0;
        const available =
          v.availableStock ?? availableUnits(v.stock, reserved);
        const threshold = v.lowStockThreshold ?? 0;
        return (
          <AvailableIndicator available={available} threshold={threshold} />
        );
      },
      meta: { className: "text-right" },
    },
    {
      id: "onHand",
      header: t("products.variantsTable.onHand"),
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.stock}</span>
      ),
      meta: { className: "text-right" },
    },
    {
      id: "reserved",
      header: t("products.variantsTable.reserved"),
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.reservedStock ?? 0}
        </span>
      ),
      meta: { className: "text-right" },
    },
    {
      id: "stockValue",
      header: t("products.variantsTable.stockValue"),
      cell: ({ row }) =>
        `€${row.original.stockValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      meta: { className: "text-right text-gray-500" },
    },
    {
      id: "sold",
      header: t("products.variantsTable.sold"),
      cell: ({ row }) => row.original.sold,
      meta: { className: "text-right" },
    },
    {
      id: "revenue",
      header: t("products.variantsTable.revenue"),
      cell: ({ row }) => `€${row.original.revenue.toFixed(2)}`,
      meta: { className: "text-right" },
    },
    {
      id: "lastSale",
      header: t("products.variantsTable.lastSale"),
      cell: ({ row }) => {
        const d = row.original.daysSinceLastSale;
        return (
          <span
            className={`text-xs ${d !== null && d > 14 ? "text-amber-500" : "text-gray-400"}`}
          >
            {d !== null ? t("common.daysAgo", { count: d }) : "—"}
          </span>
        );
      },
      meta: { className: "text-right" },
    },
  ];

  const sorted = [...variants].sort((a, b) => b.revenue - a.revenue);
  return <Table data={sorted} columns={columns} />;
};
