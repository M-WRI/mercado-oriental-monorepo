import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import {
  validateCartItems,
  buildStripeLineItems,
  createPendingCheckoutOrders,
} from "../../../lib/checkout";
import { getStripe, getStripeConfig, isStripeConfigured } from "../../../lib/stripe";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

interface CartItem {
  variantId: string;
  quantity: number;
}

export const createCheckout = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  if (!isStripeConfigured()) {
    throw new AppError({
      case: "stripe_not_configured",
      code: ERROR_CODES.SERVER_ERROR,
      statusCode: 503,
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

  const lines = await validateCartItems(items);
  const { checkoutSession, orders } = await createPendingCheckoutOrders({
    customerId,
    customerEmail: customer.email,
    customerName: customer.name,
    shippingAddress,
    customerNote,
    lines,
  });

  const stripe = getStripe();
  const { storeWebUrl } = getStripeConfig();

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: buildStripeLineItems(lines),
    success_url: `${storeWebUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${storeWebUrl}/checkout/cancel`,
    customer_email: customer.email,
    payment_intent_data: {
      metadata: {
        checkoutSessionId: checkoutSession.id,
      },
    },
    metadata: {
      checkoutSessionId: checkoutSession.id,
      orderIds: orders.map((o) => o.id).join(","),
      customerId,
    },
  });

  await prisma.checkoutSession.update({
    where: { id: checkoutSession.id },
    data: { stripeSessionId: stripeSession.id },
  });

  await prisma.order.updateMany({
    where: { checkoutSessionId: checkoutSession.id },
    data: { stripeCheckoutSessionId: stripeSession.id },
  });

  if (!stripeSession.url) {
    throw new AppError({
      case: "stripe_checkout",
      code: ERROR_CODES.SERVER_ERROR,
      statusCode: 500,
    });
  }

  return res.status(201).json({
    checkoutUrl: stripeSession.url,
    sessionId: stripeSession.id,
    checkoutSessionId: checkoutSession.id,
    orderIds: orders.map((o) => o.id),
  });
});
