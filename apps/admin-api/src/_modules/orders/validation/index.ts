import { AppError, ERROR_CODES } from "../../../lib";

const VALID_STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof VALID_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function assertValidStatusTransition(current: string, next: string): void {
  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next as OrderStatus)) {
    throw new AppError({
      case: "order_status_transition",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }
}

export function assertValidStatus(status: string): asserts status is OrderStatus {
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw new AppError({
      case: "order_status",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }
}
