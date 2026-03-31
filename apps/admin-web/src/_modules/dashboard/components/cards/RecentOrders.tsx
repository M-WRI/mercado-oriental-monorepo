import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Table } from "@mercado/shared-ui/components/table";
import { Card, CardHeader } from "@mercado/shared-ui/components/card";
import { Tag } from "@mercado/shared-ui/components/tag";
import type { IRecentOrder } from "../../types";

const statusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "cancelled":
      return "danger" as const;
    default:
      return "default" as const;
  }
};

interface RecentOrdersProps {
  orders: IRecentOrder[];
}

export const RecentOrders = ({ orders }: RecentOrdersProps) => {
  const { t } = useTranslation();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return t("common.minutesAgo", { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("common.hoursAgo", { count: hours });
    const days = Math.floor(hours / 24);
    return t("common.daysAgo", { count: days });
  };

  const columns: ColumnDef<IRecentOrder>[] = [
    {
      id: "customer",
      header: t("dashboard.customer"),
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {(o.customerName || o.customerEmail)[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {o.customerName || "—"}
              </p>
              <p className="text-xs text-gray-400 truncate">{o.customerEmail}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "amount",
      header: t("dashboard.amount"),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          €{row.original.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      id: "items",
      header: t("dashboard.items"),
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.itemCount} {row.original.itemCount !== 1 ? t("common.unit_plural") : t("common.unit")}
        </span>
      ),
    },
    {
      id: "status",
      header: t("dashboard.statusColumn"),
      cell: ({ row }) => (
        <Tag variant={statusVariant(row.original.status)}>
          {t(`dashboard.status.${row.original.status}`, {
            defaultValue: row.original.status,
          })}
        </Tag>
      ),
    },
    {
      id: "time",
      header: "",
      cell: ({ row }) => (
        <span className="text-xs text-gray-400">{timeAgo(row.original.createdAt)}</span>
      ),
    },
  ];

  if (orders.length === 0) {
    return (
      <Card padding="lg" className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-400">{t("dashboard.noOrders")}</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <CardHeader title={t("dashboard.recentOrders")} />
      <div className="flex-1 min-h-0 overflow-auto -mx-5 px-5">
        <Table data={orders} columns={columns} />
      </div>
    </Card>
  );
};
