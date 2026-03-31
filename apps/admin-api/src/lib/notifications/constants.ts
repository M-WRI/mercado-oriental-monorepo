export const NOTIFICATION_TYPE = {
  LOW_STOCK: "LOW_STOCK",
  /** A new customer order was placed for the shop (call from storefront / checkout when order is created). */
  NEW_ORDER: "NEW_ORDER",
  /**
   * Payment or payout failed (call from your PSP webhook when relevant).
   * Not wired to a provider in this codebase yet.
   */
  PAYMENT_FAILED: "PAYMENT_FAILED",
  NEW_MESSAGE: "NEW_MESSAGE",
  NEW_DISPUTE: "NEW_DISPUTE",
  DISPUTE_STATUS_CHANGE: "DISPUTE_STATUS_CHANGE",
  NEW_REVIEW: "NEW_REVIEW",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
