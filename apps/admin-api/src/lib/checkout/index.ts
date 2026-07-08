import { prisma } from "../prisma";
import { AppError, ERROR_CODES } from "../error";
import { applyInitialOrderInventory, applyOrderStatusInventoryChange } from "../inventory/orderInventory";
import { syncLowStockNotificationsForVariants } from "../inventory/lowStock";
import { getStripe, getStripeConfig, computeTransferCents, eurosToCents } from "../stripe";
import { notifyNewOrder, notifyPaymentFailed } from "../notifications/notify";

export interface CartItemInput {
  variantId: string;
  quantity: number;
}

export interface ValidatedCartLine {
  variantId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantName: string;
  attributeSummary: string;
  shopId: string;
  shopName: string;
}

export async function validateCartItems(
  items: CartItemInput[],
  options?: { skipStripeCheck?: boolean }
): Promise<ValidatedCartLine[]> {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError({ case: "order_items", code: ERROR_CODES.MISSING, statusCode: 400 });
  }

  for (const item of items) {
    if (!item.variantId || !item.quantity || item.quantity < 1) {
      throw new AppError({ case: "order_items", code: ERROR_CODES.INVALID, statusCode: 400 });
    }
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: { id: true, name: true, shopId: true, isActive: true, shop: { select: { name: true, stripeOnboardingComplete: true, stripeAccountId: true } } },
      },
      productVariantAttributeValues: {
        include: {
          productAttributeValue: {
            include: { productAttribute: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (variants.length !== variantIds.length) {
    throw new AppError({ case: "variant", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const blockedShops: { id: string; name: string }[] = [];

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId)!;
    if (!variant.product.isActive) {
      throw new AppError({ case: "product_inactive", code: ERROR_CODES.INVALID, statusCode: 400 });
    }
    const available = variant.stock - variant.reservedStock;
    if (available < item.quantity) {
      throw new AppError({ case: "inventory_availability", code: ERROR_CODES.INVALID, statusCode: 409 });
    }
    if (!options?.skipStripeCheck) {
      if (!variant.product.shop.stripeOnboardingComplete || !variant.product.shop.stripeAccountId) {
        if (!blockedShops.some((s) => s.id === variant.product.shopId)) {
          blockedShops.push({ id: variant.product.shopId, name: variant.product.shop.name });
        }
      }
    }
  }

  if (blockedShops.length > 0) {
    throw new AppError({
      case: "shop_stripe_not_ready",
      code: ERROR_CODES.INVALID,
      statusCode: 409,
      payload: { shops: blockedShops },
    });
  }

  return items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    const attrSummary = variant.productVariantAttributeValues
      .map((pav) => `${pav.productAttributeValue.productAttribute.name}: ${pav.productAttributeValue.value}`)
      .join(", ");
    return {
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice: variant.price,
      productName: variant.product.name,
      variantName: variant.name,
      attributeSummary: attrSummary,
      shopId: variant.product.shopId,
      shopName: variant.product.shop.name,
    };
  });
}

export function groupCartByShop(lines: ValidatedCartLine[]): Map<string, ValidatedCartLine[]> {
  const groups = new Map<string, ValidatedCartLine[]>();
  for (const line of lines) {
    const existing = groups.get(line.shopId) ?? [];
    existing.push(line);
    groups.set(line.shopId, existing);
  }
  return groups;
}

export async function cancelCheckoutOrders(
  checkoutSessionId: string,
  reason?: string,
  options?: { notifyVendor?: boolean; checkoutStatus?: string }
) {
  const checkout = await prisma.checkoutSession.findUnique({
    where: { id: checkoutSessionId },
    include: {
      orders: { include: { orderItems: true } },
    },
  });
  if (!checkout || checkout.status !== "pending") return;

  const allTouched: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const order of checkout.orders) {
      if (order.status !== "pending") continue;

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
        "cancelled"
      );
      allTouched.push(...touched);

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          paymentStatus: "failed",
          cancelledAt: new Date(),
          cancelReason: reason ?? "Payment not completed",
        },
      });
    }

    await tx.checkoutSession.update({
      where: { id: checkoutSessionId },
      data: { status: options?.checkoutStatus ?? "failed" },
    });
  });

  if (allTouched.length) {
    await syncLowStockNotificationsForVariants([...new Set(allTouched)]);
  }

  if (options?.notifyVendor !== false) {
    for (const order of checkout.orders) {
      notifyPaymentFailed({
        shopId: order.shopId,
        orderId: order.id,
        amount: order.totalAmount,
        reason: reason ?? "Payment not completed",
        providerReference: `checkout_cancel:${checkoutSessionId}`,
      }).catch(() => {});
    }
  }
}

export async function fulfillCheckoutSession(stripeSessionId: string) {
  const checkout = await prisma.checkoutSession.findFirst({
    where: { stripeSessionId },
    include: {
      orders: {
        include: {
          orderItems: true,
          shop: { select: { stripeAccountId: true, name: true } },
        },
      },
    },
  });

  if (!checkout || checkout.status === "completed") return;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  if (session.payment_status !== "paid") return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const { platformFeePercent } = getStripeConfig();
  const allTouched: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const order of checkout.orders) {
      if (order.paymentStatus === "paid") continue;

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
          stripeCheckoutSessionId: stripeSessionId,
          stripePaymentIntentId: paymentIntentId,
        },
      });
    }

    await tx.checkoutSession.update({
      where: { id: checkout.id },
      data: { status: "completed" },
    });
  });

  if (allTouched.length) {
    await syncLowStockNotificationsForVariants([...new Set(allTouched)]);
  }

  for (const order of checkout.orders) {
    const shopAccountId = order.shop.stripeAccountId;
    if (shopAccountId) {
      try {
        const transferAmount = computeTransferCents(order.totalAmount, platformFeePercent);
        if (transferAmount > 0) {
          const transfer = await stripe.transfers.create({
            amount: transferAmount,
            currency: "eur",
            destination: shopAccountId,
            transfer_group: checkout.id,
            metadata: { orderId: order.id, shopId: order.shopId },
          });
          await prisma.order.update({
            where: { id: order.id },
            data: { stripeTransferId: transfer.id },
          });
        }
      } catch (err) {
        console.error(`[stripe] transfer failed for order ${order.id}:`, err);
      }
    }

    notifyNewOrder(order.id).catch(() => {});
  }
}

export async function expireCheckoutSession(stripeSessionId: string) {
  const checkout = await prisma.checkoutSession.findFirst({
    where: { stripeSessionId },
  });
  if (!checkout || checkout.status !== "pending") return;

  await cancelCheckoutOrders(checkout.id, "Checkout session expired", {
    notifyVendor: false,
    checkoutStatus: "expired",
  });
}

export function buildStripeLineItems(lines: ValidatedCartLine[]) {
  return lines.map((line) => ({
    price_data: {
      currency: "eur",
      unit_amount: eurosToCents(line.unitPrice),
      product_data: {
        name: `${line.productName} — ${line.variantName}`,
        description: line.attributeSummary || undefined,
      },
    },
    quantity: line.quantity,
  }));
}

export async function createPendingCheckoutOrders(params: {
  customerId: string;
  customerEmail: string;
  customerName: string | null;
  shippingAddress?: string;
  customerNote?: string;
  lines: ValidatedCartLine[];
}) {
  const shopGroups = groupCartByShop(params.lines);
  const totalAmount = params.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return prisma.$transaction(async (tx) => {
    const checkoutSession = await tx.checkoutSession.create({
      data: {
        customerId: params.customerId,
        status: "pending",
        totalAmount,
        shippingAddress: params.shippingAddress ?? null,
        customerNote: params.customerNote ?? null,
      },
    });

    const orders: { id: string; shopId: string; totalAmount: number }[] = [];
    const allTouched: string[] = [];

    for (const [, shopLines] of shopGroups) {
      const orderTotal = shopLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      const shopId = shopLines[0].shopId;

      const order = await tx.order.create({
        data: {
          customerId: params.customerId,
          customerEmail: params.customerEmail,
          customerName: params.customerName,
          shopId,
          totalAmount: orderTotal,
          shippingAddress: params.shippingAddress ?? null,
          customerNote: params.customerNote ?? null,
          status: "pending",
          paymentStatus: "pending",
          checkoutSessionId: checkoutSession.id,
          orderItems: {
            create: shopLines.map((line) => ({
              productVariantId: line.variantId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              productName: line.productName,
              variantName: line.variantName,
              attributeSummary: line.attributeSummary,
            })),
          },
        },
        include: { orderItems: true },
      });

      const touched = await applyInitialOrderInventory(tx as any, order.id);
      allTouched.push(...touched);
      orders.push({ id: order.id, shopId, totalAmount: orderTotal });
    }

    if (allTouched.length) {
      await syncLowStockNotificationsForVariants([...new Set(allTouched)]);
    }

    return { checkoutSession, orders };
  });
}
