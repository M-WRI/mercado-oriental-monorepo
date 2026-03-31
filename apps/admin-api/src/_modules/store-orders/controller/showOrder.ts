import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

export const showOrder = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const customerId = req.customer!.customerId;

  const order = await prisma.order.findFirst({
    where: { id, customerId },
    include: {
      shop: { select: { id: true, name: true } },
      orderItems: {
        include: {
          productVariant: {
            select: {
              id: true,
              name: true,
              product: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError({ case: "order", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  return res.json({
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    customerNote: order.customerNote,
    confirmedAt: order.confirmedAt,
    packedAt: order.packedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    cancelReason: order.cancelReason,
    shop: order.shop,
    items: order.orderItems.map((oi) => ({
      id: oi.id,
      productName: oi.productVariant?.product?.name ?? oi.productName,
      variantName: oi.productVariant?.name ?? oi.variantName,
      attributeSummary: oi.attributeSummary,
      quantity: oi.quantity,
      unitPrice: oi.unitPrice,
      lineTotal: oi.quantity * oi.unitPrice,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});
