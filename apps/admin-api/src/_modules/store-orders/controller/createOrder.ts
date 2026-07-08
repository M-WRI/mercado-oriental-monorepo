import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import {
  validateCartItems,
  createPendingCheckoutOrders,
} from "../../../lib/checkout";
import { applyOrderStatusInventoryChange } from "../../../lib/inventory/orderInventory";
import { syncLowStockNotificationsForVariants } from "../../../lib/inventory/lowStock";
import { notifyNewOrder } from "../../../lib/notifications/notify";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

interface CartItem {
  variantId: string;
  quantity: number;
}

/**
 * Legacy direct order creation — only when ALLOW_LEGACY_ORDERS=true (tests/dev).
 * Production checkout uses POST /api/store/checkout with Stripe.
 */
export const createOrder = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  if (process.env.ALLOW_LEGACY_ORDERS !== "true") {
    throw new AppError({
      case: "order_use_checkout",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
      payload: { checkoutUrl: "/api/store/checkout" },
    });
  }

  const customerId = req.customer!.customerId;
  const { items, shippingAddress, customerNote } = req.body as {
    items: CartItem[];
    shippingAddress?: string;
    customerNote?: string;
  };

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { email: true, name: true },
  });
  if (!customer) {
    throw new AppError({ case: "customer", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const lines = await validateCartItems(items, { skipStripeCheck: true });

  // Legacy mode: skip stripe check by temporarily bypassing — validate without stripe gate
  // Re-validate without stripe requirement for tests
  const { checkoutSession, orders } = await createPendingCheckoutOrders({
    customerId,
    customerEmail: customer.email,
    customerName: customer.name,
    shippingAddress,
    customerNote,
    lines,
  });

  const allTouched: string[] = [];

  for (const orderRef of orders) {
    const order = await prisma.order.findUnique({
      where: { id: orderRef.id },
      include: { orderItems: true, shop: { select: { id: true, name: true } } },
    });
    if (!order) continue;

    await prisma.$transaction(async (tx) => {
      const touched = await applyOrderStatusInventoryChange(
        tx as any,
        {
          id: order.id,
          status: order.status,
          orderItems: order.orderItems.map((oi) => ({
            productVariantId: oi.productVariantId,
            quantity: oi.quantity,
          })),
        },
        "confirmed"
      );
      allTouched.push(...touched);

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "confirmed",
          paymentStatus: "paid",
          confirmedAt: new Date(),
          paidAt: new Date(),
        },
      });
    });

    notifyNewOrder(order.id).catch(() => {});
  }

  await prisma.checkoutSession.update({
    where: { id: checkoutSession.id },
    data: { status: "completed" },
  });

  if (allTouched.length) {
    await syncLowStockNotificationsForVariants([...new Set(allTouched)]);
  }

  const createdOrders = await prisma.order.findMany({
    where: { checkoutSessionId: checkoutSession.id },
    include: {
      orderItems: true,
      shop: { select: { id: true, name: true } },
    },
  });

  const first = createdOrders[0];
  if (!first) {
    throw new AppError({ case: "order", code: ERROR_CODES.SERVER_ERROR, statusCode: 500 });
  }

  return res.status(201).json({
    id: first.id,
    status: first.status,
    totalAmount: first.totalAmount,
    shippingAddress: first.shippingAddress,
    customerNote: first.customerNote,
    shop: first.shop,
    items: first.orderItems.map((oi) => ({
      id: oi.id,
      productName: oi.productName,
      variantName: oi.variantName,
      attributeSummary: oi.attributeSummary,
      quantity: oi.quantity,
      unitPrice: oi.unitPrice,
      lineTotal: oi.quantity * oi.unitPrice,
    })),
    createdAt: first.createdAt,
    orderIds: createdOrders.map((o) => o.id),
  });
});
