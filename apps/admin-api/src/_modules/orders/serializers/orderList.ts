interface RawOrder {
  id: string;
  customerEmail: string;
  customerName: string | null;
  status: string;
  totalAmount: number;
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: Date;
  updatedAt: Date;
  orderItems: { id: string }[];
}

export function serializeOrderList(orders: RawOrder[]) {
  return orders.map((o) => ({
    id: o.id,
    customerEmail: o.customerEmail,
    customerName: o.customerName,
    status: o.status,
    totalAmount: o.totalAmount,
    itemCount: o.orderItems.length,
    shippingAddress: o.shippingAddress,
    trackingNumber: o.trackingNumber,
    carrier: o.carrier,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }));
}
