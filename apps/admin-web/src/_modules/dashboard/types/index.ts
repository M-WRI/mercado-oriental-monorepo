export interface ISalesSnapshot {
  todayRevenue: number;
  todayOrders: number;
  todayUnits: number;
  yesterdayRevenue: number;
  yesterdayOrders: number;
  yesterdayUnits: number;
}

export interface IRevenueTimelineEntry {
  date: string;
  revenue: number;
  orders: number;
}

export interface IWeeklyComparison {
  thisWeekRevenue: number;
  prevWeekRevenue: number;
  revenueChangePercent: number;
}

export interface IRecentOrder {
  id: string;
  customerName: string | null;
  customerEmail: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

export interface IAlertVariant {
  id: string;
  name: string;
  /** On-hand quantity (legacy / fallback). */
  stock: number;
  /** Sellable quantity (stock − reserved) when provided by API. */
  available?: number;
  productName: string;
}

export interface IInventoryAlerts {
  alertVariants: IAlertVariant[];
  outOfStockCount: number;
  lowStockCount: number;
  totalStock: number;
  totalStockValue: number;
}

export interface ITopProduct {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
}

export interface ICustomerStats {
  totalCustomers: number;
  repeatBuyerCount: number;
  newCustomersThisWeek: number;
  repeatRate: number;
}

export interface IDashboardTotals {
  totalRevenue: number;
  totalProducts: number;
  totalAttributes: number;
  totalOrders: number;
}

export interface IDashboardResponse {
  salesSnapshot: ISalesSnapshot;
  revenueTimeline: IRevenueTimelineEntry[];
  weeklyComparison: IWeeklyComparison;
  recentOrders: IRecentOrder[];
  inventoryAlerts: IInventoryAlerts;
  topProducts: ITopProduct[];
  customerStats: ICustomerStats;
  totals: IDashboardTotals;
}
