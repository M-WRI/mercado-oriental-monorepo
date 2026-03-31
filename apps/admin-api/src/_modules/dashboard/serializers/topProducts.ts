interface OrderWithItems {
  createdAt: Date;
  orderItems: {
    unitPrice: number;
    quantity: number;
    productName?: string;
    productVariant: {
      product: { id: string; name: string };
    } | null;
  }[];
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
}

export function serializeTopProducts(
  allOrders: OrderWithItems[],
  since: Date,
  limit = 5
): TopProduct[] {
  const recentOrders = allOrders.filter((o) => o.createdAt >= since);
  const productSales = new Map<string, TopProduct>();

  for (const order of recentOrders) {
    for (const item of order.orderItems) {
      const prodId = item.productVariant?.product.id ?? `deleted-${item.productName || "unknown"}`;
      const prodName = item.productVariant?.product.name ?? item.productName ?? "Deleted product";

      const existing = productSales.get(prodId) || {
        id: prodId,
        name: prodName,
        revenue: 0,
        unitsSold: 0,
      };
      existing.revenue += item.unitPrice * item.quantity;
      existing.unitsSold += item.quantity;
      productSales.set(prodId, existing);
    }
  }

  return Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
