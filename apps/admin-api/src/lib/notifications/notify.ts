import { prisma } from "../prisma";
import { NOTIFICATION_TYPE } from "./constants";

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

/**
 * Create an in-app notification for the shop owner when a new order is placed.
 * Idempotent per order (`dedupeKey` = new_order:{orderId}).
 */
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
}

export interface NotifyPaymentFailedParams {
  shopId: string;
  orderId?: string | null;
  amount?: number | null;
  reason?: string | null;
  /** Idempotency key from the payment provider (charge id, event id, etc.). */
  providerReference: string;
}

/**
 * In-app alert when a charge or payout fails. Wire this from your payment webhook.
 * `providerReference` must be unique per failure event for correct deduping.
 */
/**
 * Notify shop owner when a customer sends a message on an order.
 */
export async function notifyNewMessage(orderId: string, customerName: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: { select: { userId: true } } },
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
}

/**
 * Notify shop owner when a customer opens a dispute.
 */
export async function notifyNewDispute(orderId: string, disputeId: string, reason: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: { select: { userId: true } } },
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
}

/**
 * Notify shop owner when a dispute status changes.
 */
export async function notifyDisputeStatusChange(
  orderId: string,
  disputeId: string,
  oldStatus: string,
  newStatus: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: { select: { userId: true } } },
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
}

/**
 * Notify shop owner when a customer leaves a product review.
 */
export async function notifyNewReview(reviewId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { shop: { select: { userId: true } } },
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
}
