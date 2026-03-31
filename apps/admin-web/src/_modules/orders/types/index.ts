export type OrderStatus = "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";

export interface IOrderListItem {
  id: string;
  customerEmail: string;
  customerName: string | null;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productName: string;
  variantName: string;
  attributeSummary: string;
  productVariantId: string | null;
  currentStock: number | null;
}

export interface IOrderDetailResponse {
  id: string;
  customerEmail: string;
  customerName: string | null;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  customerNote: string | null;
  internalNote: string | null;
  cancelReason: string | null;
  confirmedAt: string | null;
  packedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  shop: { id: string; name: string };
  items: IOrderItem[];
}
