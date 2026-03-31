interface OrderWithItems {
  totalAmount: number;
  createdAt: Date;
  orderItems: { quantity: number }[];
}

export interface SalesSnapshot {
  todayRevenue: number;
  todayOrders: number;
  todayUnits: number;
  yesterdayRevenue: number;
  yesterdayOrders: number;
  yesterdayUnits: number;
}

function sumUnits(orders: OrderWithItems[]): number {
  return orders.reduce(
    (s, o) => s + o.orderItems.reduce((ss, oi) => ss + oi.quantity, 0),
    0
  );
}

export function serializeSalesSnapshot(
  allOrders: OrderWithItems[],
  todayStart: Date,
  yesterdayStart: Date
): SalesSnapshot {
  const todayOrders = allOrders.filter((o) => o.createdAt >= todayStart);
  const yesterdayOrders = allOrders.filter(
    (o) => o.createdAt >= yesterdayStart && o.createdAt < todayStart
  );

  return {
    todayRevenue: todayOrders.reduce((s, o) => s + o.totalAmount, 0),
    todayOrders: todayOrders.length,
    todayUnits: sumUnits(todayOrders),
    yesterdayRevenue: yesterdayOrders.reduce((s, o) => s + o.totalAmount, 0),
    yesterdayOrders: yesterdayOrders.length,
    yesterdayUnits: sumUnits(yesterdayOrders),
  };
}
