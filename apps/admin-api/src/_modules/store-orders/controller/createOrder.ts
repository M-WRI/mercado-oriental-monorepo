import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { applyInitialOrderInventory, applyOrderStatusInventoryChange } from "../../../lib/inventory/orderInventory";
import { syncLowStockNotificationsForVariants } from "../../../lib/inventory/lowStock";
import { notifyNewOrder } from "../../../lib/notifications/notify";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

interface CartItem {
  variantId: string;
  quantity: number;
}

export const createOrder = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer!.customerId;
  const { items, shippingAddress, customerNote } = req.body as {
    items: CartItem[];
    shippingAddress?: string;
    customerNote?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError({ case: "order_items", code: ERROR_CODES.MISSING, statusCode: 400 });
  }

  for (const item of items) {
    if (!item.variantId || !item.quantity || item.quantity < 1) {
      throw new AppError({ case: "order_items", code: ERROR_CODES.INVALID, statusCode: 400 });
    }
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { email: true, name: true },
  });
  if (!customer) {
    throw new AppError({ case: "customer", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: { id: true, name: true, shopId: true, isActive: true },
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

  const shopIds = new Set(variants.map((v) => v.product.shopId));
  if (shopIds.size > 1) {
    throw new AppError({ case: "order_multi_shop", code: ERROR_CODES.INVALID, statusCode: 400 });
  }
  const shopId = [...shopIds][0];

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId)!;
    if (!variant.product.isActive) {
      throw new AppError({ case: "product_inactive", code: ERROR_CODES.INVALID, statusCode: 400 });
    }
    const available = variant.stock - variant.reservedStock;
    if (available < item.quantity) {
      throw new AppError({ case: "inventory_availability", code: ERROR_CODES.INVALID, statusCode: 409 });
    }
  }

  const orderItems = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    const attrSummary = variant.productVariantAttributeValues
      .map((pav) => `${pav.productAttributeValue.productAttribute.name}: ${pav.productAttributeValue.value}`)
      .join(", ");
    return {
      productVariantId: variant.id,
      quantity: item.quantity,
      unitPrice: variant.price,
      productName: variant.product.name,
      variantName: variant.name,
      attributeSummary: attrSummary,
    };
  });

  const totalAmount = orderItems.reduce((sum, oi) => sum + oi.unitPrice * oi.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerId,
        customerEmail: customer.email,
        customerName: customer.name,
        shopId,
        totalAmount,
        shippingAddress: shippingAddress || null,
        customerNote: customerNote || null,
        status: "pending",
        orderItems: { create: orderItems },
      },
      include: {
        orderItems: true,
        shop: { select: { id: true, name: true } },
      },
    });

    // Reserve stock (pending → reservedStock++)
    const touched = await applyInitialOrderInventory(tx as any, created.id);

    // Auto-confirm: deduct stock immediately (reservedStock--, stock--)
    const orderForTransition = {
      id: created.id,
      status: "pending",
      orderItems: created.orderItems.map((oi) => ({
        productVariantId: oi.productVariantId,
        quantity: oi.quantity,
      })),
    };
    const confirmedTouched = await applyOrderStatusInventoryChange(
      tx as any,
      orderForTransition,
      "confirmed"
    );

    await tx.order.update({
      where: { id: created.id },
      data: { status: "confirmed", confirmedAt: new Date() },
    });

    const allTouched = [...new Set([...touched, ...confirmedTouched])];
    if (allTouched.length) {
      await syncLowStockNotificationsForVariants(allTouched);
    }

    return { ...created, status: "confirmed" };
  });

  notifyNewOrder(order.id).catch(() => {});

  return res.status(201).json({
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    customerNote: order.customerNote,
    shop: order.shop,
    items: order.orderItems.map((oi) => ({
      id: oi.id,
      productName: oi.productName,
      variantName: oi.variantName,
      attributeSummary: oi.attributeSummary,
      quantity: oi.quantity,
      unitPrice: oi.unitPrice,
      lineTotal: oi.quantity * oi.unitPrice,
    })),
    createdAt: order.createdAt,
  });
});
