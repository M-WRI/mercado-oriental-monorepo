interface RawOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantName: string;
  attributeSummary: string;
  productVariantId: string | null;
  productVariant: {
    id: string;
    name: string;
    stock: number;
    product: { id: string; name: string };
  } | null;
}

interface RawOrderDetail {
  id: string;
  customerEmail: string;
  customerName: string | null;
  status: string;
  totalAmount: number;
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  customerNote: string | null;
  internalNote: string | null;
  cancelReason: string | null;
  confirmedAt: Date | null;
  packedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  shop: { id: string; name: string };
  orderItems: RawOrderItem[];
}

export function serializeOrderDetail(order: RawOrderDetail) {
  return {
    id: order.id,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    status: order.status,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    customerNote: order.customerNote,
    internalNote: order.internalNote,
    cancelReason: order.cancelReason,
    confirmedAt: order.confirmedAt,
    packedAt: order.packedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shop: order.shop,
    items: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.quantity * item.unitPrice,
      productName: item.productVariant?.product?.name ?? item.productName,
      variantName: item.productVariant?.name ?? item.variantName,
      attributeSummary: item.attributeSummary,
      productVariantId: item.productVariantId,
      currentStock: item.productVariant?.stock ?? null,
    })),
  };
}
