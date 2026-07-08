import { NOTIFICATION_TYPE, type NotificationType } from "../notifications/constants";
import { getEmailConfig } from "./config";
import { sendTemplateEmail } from "./sendEmail";

function formatAmount(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

export async function emailVendorNewOrder(params: {
  to: string;
  shopName: string;
  customer: string;
  amount: number;
  orderId: string;
  shopId: string;
}) {
  const { adminWebUrl } = getEmailConfig();
  await sendTemplateEmail({
    to: params.to,
    template: "NEW_ORDER",
    params: {
      shopName: params.shopName,
      customer: params.customer,
      amount: formatAmount(params.amount),
      orderUrl: `${adminWebUrl}/s/${params.shopId}/orders/${params.orderId}`,
    },
    tags: ["NEW_ORDER"],
  });
}

export async function emailVendorPaymentFailed(params: {
  to: string;
  amount?: number | null;
  reason?: string | null;
  orderId?: string | null;
  shopId?: string | null;
}) {
  const { adminWebUrl } = getEmailConfig();
  const orderUrl =
    params.orderId && params.shopId
      ? `${adminWebUrl}/s/${params.shopId}/orders/${params.orderId}`
      : "";
  await sendTemplateEmail({
    to: params.to,
    template: "PAYMENT_FAILED",
    params: {
      amount: params.amount != null ? formatAmount(params.amount) : "Unknown",
      reason: params.reason?.trim() ?? "",
      orderUrl,
    },
    tags: ["PAYMENT_FAILED"],
  });
}

export async function emailVendorNewDispute(params: {
  to: string;
  customer: string;
  reason: string;
  orderId: string;
  shopId: string;
}) {
  const { adminWebUrl } = getEmailConfig();
  await sendTemplateEmail({
    to: params.to,
    template: "NEW_DISPUTE",
    params: {
      customer: params.customer,
      reason: params.reason,
      orderId: params.orderId.slice(0, 8),
      orderUrl: `${adminWebUrl}/s/${params.shopId}/orders/${params.orderId}`,
    },
    tags: ["NEW_DISPUTE"],
  });
}

export async function emailVendorNewMessage(params: {
  to: string;
  customerName: string;
  orderId: string;
  shopId: string;
}) {
  const { adminWebUrl } = getEmailConfig();
  await sendTemplateEmail({
    to: params.to,
    template: "NEW_MESSAGE",
    params: {
      customerName: params.customerName,
      orderId: params.orderId.slice(0, 8),
      orderUrl: `${adminWebUrl}/s/${params.shopId}/orders/${params.orderId}`,
    },
    tags: ["NEW_MESSAGE"],
  });
}

export async function emailVendorLowStock(params: {
  to: string;
  productName: string;
  variantName: string;
  available: number;
  threshold: number;
  shopId: string;
}) {
  const { adminWebUrl } = getEmailConfig();
  await sendTemplateEmail({
    to: params.to,
    template: "LOW_STOCK",
    params: {
      productName: params.productName,
      variantName: params.variantName,
      available: params.available,
      threshold: params.threshold,
      inventoryUrl: `${adminWebUrl}/s/${params.shopId}/inventory`,
    },
    tags: ["LOW_STOCK"],
  });
}

export async function emailVendorNewReview(params: {
  to: string;
  customer: string;
  productName: string;
  rating: number;
  productId: string;
  shopId: string;
}) {
  const { adminWebUrl } = getEmailConfig();
  const stars = "★".repeat(params.rating) + "☆".repeat(5 - params.rating);
  await sendTemplateEmail({
    to: params.to,
    template: "NEW_REVIEW",
    params: {
      customer: params.customer,
      productName: params.productName,
      rating: params.rating,
      stars,
      productUrl: `${adminWebUrl}/s/${params.shopId}/products/${params.productId}`,
    },
    tags: ["NEW_REVIEW"],
  });
}

export async function emailVendorDisputeStatusChange(params: {
  to: string;
  orderId: string;
  shopId: string;
  oldStatus: string;
  newStatus: string;
}) {
  const { adminWebUrl } = getEmailConfig();
  await sendTemplateEmail({
    to: params.to,
    template: "DISPUTE_STATUS_CHANGE",
    params: {
      orderId: params.orderId.slice(0, 8),
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      orderUrl: `${adminWebUrl}/s/${params.shopId}/orders/${params.orderId}`,
    },
    tags: ["DISPUTE_STATUS_CHANGE"],
  });
}

export async function emailPasswordReset(params: { to: string; resetUrl: string }) {
  await sendTemplateEmail({
    to: params.to,
    template: "PASSWORD_RESET",
    params: {
      resetUrl: params.resetUrl,
      expiryHours: 1,
    },
    tags: ["PASSWORD_RESET"],
  });
}

export async function emailWelcomeVendor(params: { to: string; name?: string | null }) {
  const { adminWebUrl } = getEmailConfig();
  await sendTemplateEmail({
    to: params.to,
    template: "WELCOME_VENDOR",
    params: {
      name: params.name?.trim() || "there",
      adminUrl: adminWebUrl,
    },
    tags: ["WELCOME_VENDOR"],
  });
}

export async function dispatchVendorEmailForNotification(
  type: NotificationType,
  userEmail: string,
  payload: Record<string, unknown>
): Promise<void> {
  switch (type) {
    case NOTIFICATION_TYPE.NEW_ORDER:
      await emailVendorNewOrder({
        to: userEmail,
        shopName: String(payload.shopName ?? "Shop"),
        customer: String(payload.customer ?? "Customer"),
        amount: Number(payload.totalAmount ?? 0),
        orderId: String(payload.orderId),
        shopId: String(payload.shopId),
      });
      break;
    case NOTIFICATION_TYPE.PAYMENT_FAILED:
      await emailVendorPaymentFailed({
        to: userEmail,
        amount: payload.amount as number | null | undefined,
        reason: payload.reason as string | null | undefined,
        orderId: payload.orderId as string | null | undefined,
        shopId: payload.shopId as string | null | undefined,
      });
      break;
    case NOTIFICATION_TYPE.NEW_DISPUTE:
      await emailVendorNewDispute({
        to: userEmail,
        customer: String(payload.customer),
        reason: String(payload.reason),
        orderId: String(payload.orderId),
        shopId: String(payload.shopId),
      });
      break;
    case NOTIFICATION_TYPE.NEW_MESSAGE:
      await emailVendorNewMessage({
        to: userEmail,
        customerName: String(payload.customerName),
        orderId: String(payload.orderId),
        shopId: String(payload.shopId),
      });
      break;
    case NOTIFICATION_TYPE.LOW_STOCK:
      await emailVendorLowStock({
        to: userEmail,
        productName: String(payload.productName),
        variantName: String(payload.variantName),
        available: Number(payload.available),
        threshold: Number(payload.threshold),
        shopId: String(payload.shopId),
      });
      break;
    case NOTIFICATION_TYPE.NEW_REVIEW:
      await emailVendorNewReview({
        to: userEmail,
        customer: String(payload.customer),
        productName: String(payload.productName),
        rating: Number(payload.rating),
        productId: String(payload.productId),
        shopId: String(payload.shopId),
      });
      break;
    case NOTIFICATION_TYPE.DISPUTE_STATUS_CHANGE:
      await emailVendorDisputeStatusChange({
        to: userEmail,
        orderId: String(payload.orderId),
        shopId: String(payload.shopId),
        oldStatus: String(payload.oldStatus),
        newStatus: String(payload.newStatus),
      });
      break;
    default:
      break;
  }
}
