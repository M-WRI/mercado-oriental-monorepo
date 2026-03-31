interface OrderWithEmail {
  customerEmail: string;
  createdAt: Date;
}

export interface CustomerStats {
  totalCustomers: number;
  repeatBuyerCount: number;
  newCustomersThisWeek: number;
  repeatRate: number;
}

export function serializeCustomerStats(
  allOrders: OrderWithEmail[],
  weekStart: Date
): CustomerStats {
  const customerMap = new Map<string, { orders: number; firstOrder: Date }>();

  for (const order of allOrders) {
    const key = order.customerEmail;
    const existing = customerMap.get(key);
    if (existing) {
      existing.orders += 1;
    } else {
      customerMap.set(key, { orders: 1, firstOrder: order.createdAt });
    }
  }

  const totalCustomers = customerMap.size;
  const repeatBuyerCount = Array.from(customerMap.values()).filter(
    (c) => c.orders > 1
  ).length;
  const newCustomersThisWeek = Array.from(customerMap.values()).filter(
    (c) => c.firstOrder >= weekStart
  ).length;

  return {
    totalCustomers,
    repeatBuyerCount,
    newCustomersThisWeek,
    repeatRate: totalCustomers > 0 ? Math.round((repeatBuyerCount / totalCustomers) * 100) : 0,
  };
}
