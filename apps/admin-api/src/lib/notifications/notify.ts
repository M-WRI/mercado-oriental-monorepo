import { prisma } from "../prisma";
import {
  dispatchVendorEmailForNotification,
  emailWelcomeVendor,
} from "../email";
import { NOTIFICATION_TYPE } from "./constants";

async function getUserEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

function fireVendorEmail(
  userId: string,
  type: (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE],
  payload: Record<string, unknown>
) {
  getUserEmail(userId)
    .then((email) => {
      if (!email) return;
      return dispatchVendorEmailForNotification(type, email, payload);
    })
    .catch((err) => console.error("[email] vendor notification failed:", err));
}

function dedupeNewOrder(orderId: string) {
  return `new_order:${orderId}`;
}

function dedupePaymentFailed(
  shopId: string,
  orderId: string | null | undefined,
  providerReference: string
) {
  return `payment_failed:${shopId}:${orderId ?? "no_order"}:${providerReference}`;
}

export async function notifyNewOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shop: { select: { userId: true, name: true } },
    },
  });
  if (!order) return;

  const customer = order.customerName?.trim() || order.customerEmail;
  const amount = Number(order.totalAmount);
  const amountStr =
    Number.isFinite(amount) && amount % 1 !== 0
      ? amount.toFixed(2)
      : String(amount);

  await prisma.notification.upsert({
    where: { dedupeKey: dedupeNewOrder(orderId) },
    create: {
      userId: order.shop.userId,
      type: NOTIFICATION_TYPE.NEW_ORDER,
      title: "New order",
      body: `${customer} — €${amountStr} · ${order.status}`,
      dedupeKey: dedupeNewOrder(orderId),
      payload: {
        orderId: order.id,
        shopId: order.shopId,
        totalAmount: amount,
        status: order.status,
        customerEmail: order.customerEmail,
      },
    },
    update: {
      title: "New order",
      body: `${customer} — €${amountStr} · ${order.status}`,
      readAt: null,
      payload: {
        orderId: order.id,
        shopId: order.shopId,
        totalAmount: amount,
        status: order.status,
        customerEmail: order.customerEmail,
      },
    },
  });

  fireVendorEmail(order.shop.userId, NOTIFICATION_TYPE.NEW_ORDER, {
    shopName: order.shop.name,
    customer,
    totalAmount: amount,
    orderId: order.id,
    shopId: order.shopId,
  });
}

export interface NotifyPaymentFailedParams {
  shopId: string;
  orderId?: string | null;
  amount?: number | null;
  reason?: string | null;
  providerReference: string;
}

export async function notifyNewMessage(orderId: string, customerName: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: { select: { userId: true, id: true } } },
  });
  if (!order) return;

  await prisma.notification.create({
    data: {
      userId: order.shop.userId,
      type: NOTIFICATION_TYPE.NEW_MESSAGE,
      title: "New message",
      body: `${customerName} sent a message on order #${orderId.slice(0, 8)}`,
      payload: { orderId },
    },
  });

  fireVendorEmail(order.shop.userId, NOTIFICATION_TYPE.NEW_MESSAGE, {
    customerName,
    orderId,
    shopId: order.shop.id,
  });
}

export async function notifyNewDispute(orderId: string, disputeId: string, reason: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: { select: { userId: true, id: true } } },
  });
  if (!order) return;

  const customer = order.customerName?.trim() || order.customerEmail;

  await prisma.notification.create({
    data: {
      userId: order.shop.userId,
      type: NOTIFICATION_TYPE.NEW_DISPUTE,
      title: "New dispute opened",
      body: `${customer} — order #${orderId.slice(0, 8)}: ${reason.slice(0, 80)}`,
      payload: { orderId, disputeId },
    },
  });

  fireVendorEmail(order.shop.userId, NOTIFICATION_TYPE.NEW_DISPUTE, {
    customer,
    reason,
    orderId,
    shopId: order.shop.id,
  });
}

export async function notifyDisputeStatusChange(
  orderId: string,
  disputeId: string,
  oldStatus: string,
  newStatus: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: { select: { userId: true, id: true } } },
  });
  if (!order) return;

  await prisma.notification.create({
    data: {
      userId: order.shop.userId,
      type: NOTIFICATION_TYPE.DISPUTE_STATUS_CHANGE,
      title: "Dispute status updated",
      body: `Order #${orderId.slice(0, 8)} — ${oldStatus} → ${newStatus}`,
      payload: { orderId, disputeId, oldStatus, newStatus },
    },
  });

  fireVendorEmail(order.shop.userId, NOTIFICATION_TYPE.DISPUTE_STATUS_CHANGE, {
    orderId,
    shopId: order.shop.id,
    oldStatus,
    newStatus,
  });
}

export async function notifyNewReview(reviewId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { shop: { select: { userId: true, id: true } } },
  });
  if (!product) return;

  const review = await prisma.productReview.findUnique({ where: { id: reviewId } });
  if (!review) return;

  const customer = review.customerName?.trim() || review.customerEmail;
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  await prisma.notification.create({
    data: {
      userId: product.shop.userId,
      type: NOTIFICATION_TYPE.NEW_REVIEW,
      title: "New product review",
      body: `${customer} rated ${product.name} ${stars}`,
      payload: { reviewId, productId },
    },
  });

  fireVendorEmail(product.shop.userId, NOTIFICATION_TYPE.NEW_REVIEW, {
    customer,
    productName: product.name,
    rating: review.rating,
    productId,
    shopId: product.shop.id,
  });
}

export async function notifyPaymentFailed(params: NotifyPaymentFailedParams) {
  const shop = await prisma.shop.findUnique({
    where: { id: params.shopId },
    select: { userId: true, name: true },
  });
  if (!shop) return;

  const key = dedupePaymentFailed(
    params.shopId,
    params.orderId,
    params.providerReference
  );

  const amountPart =
    params.amount != null && Number.isFinite(Number(params.amount))
      ? `€${Number(params.amount).toFixed(2)}`
      : "Amount unknown";
  const reasonPart = params.reason?.trim() ? ` — ${params.reason.trim()}` : "";

  const title = "Payment failed";
  const body = params.orderId
    ? `${amountPart} (order)${reasonPart}`
    : `${amountPart}${reasonPart}`;

  await prisma.notification.upsert({
    where: { dedupeKey: key },
    create: {
      userId: shop.userId,
      type: NOTIFICATION_TYPE.PAYMENT_FAILED,
      title,
      body,
      dedupeKey: key,
      payload: {
        shopId: params.shopId,
        orderId: params.orderId ?? null,
        amount: params.amount ?? null,
        reason: params.reason ?? null,
        providerReference: params.providerReference,
      },
    },
    update: {
      title,
      body,
      readAt: null,
      payload: {
        shopId: params.shopId,
        orderId: params.orderId ?? null,
        amount: params.amount ?? null,
        reason: params.reason ?? null,
        providerReference: params.providerReference,
      },
    },
  });

  fireVendorEmail(shop.userId, NOTIFICATION_TYPE.PAYMENT_FAILED, {
    shopId: params.shopId,
    orderId: params.orderId ?? null,
    amount: params.amount ?? null,
    reason: params.reason ?? null,
  });
}

export function notifyWelcomeVendor(userId: string, name?: string | null) {
  getUserEmail(userId)
    .then((email) => {
      if (!email) return;
      return emailWelcomeVendor({ to: email, name });
    })
    .catch((err) => console.error("[email] welcome email failed:", err));
}
