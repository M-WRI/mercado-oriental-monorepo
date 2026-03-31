import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Table } from "@mercado/shared-ui/components/table";
import { Tag } from "@mercado/shared-ui/components/tag";
import type { ICustomerStat } from "../../types";

interface CustomersTableProps {
  customers: ICustomerStat[];
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const CustomersTable = ({ customers }: CustomersTableProps) => {
  const { t } = useTranslation();

  const columns: ColumnDef<ICustomerStat>[] = [
    {
      id: "customer",
      header: t("products.customersTable.customer"),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {(c.name || c.email)[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {c.name || "—"}
              </p>
              <p className="text-xs text-gray-400 truncate">{c.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "orders",
      header: t("products.customersTable.orders"),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <span>{c.orderCount}</span>
            {c.orderCount > 1 && (
              <Tag variant="success">{t("products.customersTable.repeat")}</Tag>
            )}
          </div>
        );
      },
      meta: { className: "text-right" },
    },
    {
      id: "units",
      header: t("products.customersTable.units"),
      cell: ({ row }) => row.original.totalUnits,
      meta: { className: "text-right" },
    },
    {
      id: "spent",
      header: t("products.customersTable.spent"),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          €{row.original.totalSpent.toFixed(2)}
        </span>
      ),
      meta: { className: "text-right" },
    },
    {
      id: "firstOrder",
      header: t("products.customersTable.firstOrder"),
      cell: ({ row }) => (
        <span className="text-xs text-gray-400">
          {formatDate(row.original.firstOrder)}
        </span>
      ),
      meta: { className: "text-right" },
    },
    {
      id: "lastOrder",
      header: t("products.customersTable.lastOrder"),
      cell: ({ row }) => (
        <span className="text-xs text-gray-400">
          {formatDate(row.original.lastOrder)}
        </span>
      ),
      meta: { className: "text-right" },
    },
  ];

  return <Table data={customers} columns={columns} />;
};
