import { useTranslation } from "react-i18next";
import { useFetch } from "@/_shared/queryProvider";
import { QueryError } from "@mercado/shared-ui";
import { getDashboard } from "../api";
import type { IDashboardResponse } from "../types";
import {
  SalesSnapshot,
  RevenueChart,
  RecentOrders,
  InventoryAlerts,
  TopProducts,
  CustomerOverview,
} from "../components";

export const DashboardScreen = () => {
  const { t } = useTranslation();
  const { data: dashboard, isLoading, isError, refetch } = useFetch<IDashboardResponse>({
    queryKey: getDashboard.queryKey,
    url: getDashboard.url,
  });

  if (isLoading || (!isError && !dashboard)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("dashboard.loading")}</p>
      </div>
    );
  }

  if (isError || !dashboard) {
    return <QueryError onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      {/* Header */}
      <div className="shrink-0 mb-6">
        <h4 className="text-lg font-semibold text-gray-900">{t("dashboard.title")}</h4>
        <p className="text-sm text-gray-500 mt-0.5">{t("dashboard.subtitle")}</p>
      </div>

      {/* KPI cards */}
      <SalesSnapshot
        snapshot={dashboard.salesSnapshot}
        totals={dashboard.totals}
        revenueChangePercent={dashboard.weeklyComparison.revenueChangePercent}
      />

      {/* Revenue chart + Inventory alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <RevenueChart
            data={dashboard.revenueTimeline}
            thisWeekRevenue={dashboard.weeklyComparison.thisWeekRevenue}
            prevWeekRevenue={dashboard.weeklyComparison.prevWeekRevenue}
          />
        </div>
        <div className="lg:col-span-1">
          <InventoryAlerts alerts={dashboard.inventoryAlerts} />
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-4">
        <RecentOrders orders={dashboard.recentOrders} />
      </div>

      {/* Top products + Customer overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <TopProducts products={dashboard.topProducts} />
        </div>
        <div className="lg:col-span-1">
          <CustomerOverview stats={dashboard.customerStats} />
        </div>
      </div>
    </div>
  );
};
