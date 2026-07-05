import type { OrderStatus } from "../types";

export const ORDER_FLOW_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
];

export const ORDER_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "packed",
  packed: "shipped",
  shipped: "delivered",
};

export const CANCELABLE_ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "packed"];

export function formatOrderTimestamp(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOrderDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
