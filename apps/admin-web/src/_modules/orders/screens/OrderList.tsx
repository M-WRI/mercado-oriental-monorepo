import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { useListQuery } from "@/_shared/hooks";
import { Button, Tag, QueryError } from "@mercado/shared-ui";
import { DefaultListLayout } from "@/_shared/layout";
import { formatCurrency } from "@mercado/shared-ui";
import { getOrders } from "../api";
import type { IOrderListItem, OrderStatus } from "../types";
import type { FilterConfig } from "@mercado/shared-ui";

const STATUS_CONFIG: Record<
  OrderStatus,
  { labelKey: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  pending: { labelKey: "orders.statuses.pending", variant: "warning" },
  confirmed: { labelKey: "orders.statuses.confirmed", variant: "info" },
  packed: { labelKey: "orders.statuses.packed", variant: "info" },
  shipped: { labelKey: "orders.statuses.shipped", variant: "default" },
  delivered: { labelKey: "orders.statuses.delivered", variant: "success" },
  cancelled: { labelKey: "orders.statuses.cancelled", variant: "danger" },
};

export const OrderList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        type: "search",
        placeholder: t("filters.searchOrders"),
      },
      {
        type: "select",
        paramKey: "status",
        label: t("orders.status"),
        options: [
          { value: "pending", label: t("orders.statuses.pending") },
          { value: "confirmed", label: t("orders.statuses.confirmed") },
          { value: "packed", label: t("orders.statuses.packed") },
          { value: "shipped", label: t("orders.statuses.shipped") },
          { value: "delivered", label: t("orders.statuses.delivered") },
          { value: "cancelled", label: t("orders.statuses.cancelled") },
        ],
      },
      {
        type: "sort",
        options: [
          { value: "createdAt", label: t("filters.sortDate") },
          { value: "totalAmount", label: t("filters.sortAmount") },
        ],
      },
    ],
    [t],
  );

  const {
    data: orders,
    meta,
    isLoading,
    isError,
    refetch,
    params,
    setSearch,
    setFilter,
    setSorting,
    setPage,
    setPageSize,
  } = useListQuery<IOrderListItem>({
    queryKey: getOrders.queryKey,
    url: getOrders.url,
  });

  const columns: ColumnDef<IOrderListItem>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: t("orders.order"),
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-gray-900 font-mono">
              #{row.original.id.slice(0, 8)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(row.original.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "customerEmail",
        header: t("orders.customer"),
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {row.original.customerName ?? row.original.customerEmail}
            </p>
            {row.original.customerName && (
              <p className="text-xs text-gray-400">{row.original.customerEmail}</p>
            )}
          </div>
        ),
      },
      {
        id: "items",
        header: t("orders.items"),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.itemCount}{" "}
            {row.original.itemCount !== 1 ? t("orders.itemPlural") : t("orders.item")}
          </span>
        ),
      },
      {
        id: "total",
        header: t("orders.total"),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(row.original.totalAmount)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("orders.status"),
        cell: ({ row }) => {
          const cfg = STATUS_CONFIG[row.original.status];
          return (
            <Tag variant={cfg.variant} dot>
              {t(cfg.labelKey)}
            </Tag>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Button
              onClick={() => navigate(`/orders/${row.original.id}`)}
              style="primaryOutline"
              className="!text-xs !px-2 !py-1"
            >
              {t("common.show")}
            </Button>
          </div>
        ),
      },
    ],
    [t, navigate],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (isError) {
    return <QueryError onRetry={() => refetch()} />;
  }

  return (
    <DefaultListLayout<IOrderListItem>
      title={t("orders.title")}
      subtitle={t("filters.totalResults", { count: meta.total })}
      tableData={orders}
      tableColumns={columns}
      filterConfigs={filterConfigs}
      search={params.search}
      onSearchChange={setSearch}
      activeFilters={params.filters}
      onFilterChange={setFilter}
      sortField={params.sort}
      sortOrder={params.order}
      onSort={setSorting}
      page={meta.page}
      totalPages={meta.totalPages}
      total={meta.total}
      limit={meta.limit}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  );
};
