interface OrderWithItems {
  id: string;
  customerName: string | null;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  orderItems: { quantity: number }[];
}

export interface RecentOrder {
  id: string;
  customerName: string | null;
  customerEmail: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

export function serializeRecentOrders(
  allOrders: OrderWithItems[],
  limit = 10
): RecentOrder[] {
  return allOrders.slice(0, limit).map((o) => ({
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    totalAmount: o.totalAmount,
    status: o.status,
    itemCount: o.orderItems.reduce((s, oi) => s + oi.quantity, 0),
    createdAt: o.createdAt.toISOString(),
  }));
}
