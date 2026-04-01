export interface OrderListItem {
  id: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  shop: { id: string; name: string };
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
}

export interface OrderListResponse {
  data: OrderListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderDetailItem {
  id: string;
  productName: string;
  variantName: string;
  attributeSummary: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  customerNote: string | null;
  confirmedAt: string | null;
  packedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  shop: { id: string; name: string };
  items: OrderDetailItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[];
  shippingAddress?: string;
  customerNote?: string;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  sender: "customer" | "vendor";
  body: string;
  createdAt: string;
}
