import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { assertValidStatus, assertValidStatusTransition } from "../validation";
import {
  applyOrderStatusInventoryChange,
  syncLowStockNotificationsForVariants,
} from "../../../lib/inventory";

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, carrier, cancelReason } = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  if (!status || typeof status !== "string") {
    throw new AppError({
      case: "order_status",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  assertValidStatus(status);

  const order = await prisma.order.findFirst({
    where: { id, shopId: { in: shopIds } },
    include: { orderItems: true },
  });

  if (!order) {
    throw new AppError({
      case: "order",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  assertValidStatusTransition(order.status, status);

  if (status === "shipped" && !trackingNumber && !order.trackingNumber) {
    throw new AppError({
      case: "order_tracking",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const now = new Date();
  const updateData: {
    status: string;
    confirmedAt?: Date;
    packedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    trackingNumber?: string;
    carrier?: string;
  } = { status };

  switch (status) {
    case "confirmed":
      updateData.confirmedAt = now;
      break;
    case "packed":
      updateData.packedAt = now;
      break;
    case "shipped":
      updateData.shippedAt = now;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (carrier) updateData.carrier = carrier;
      break;
    case "delivered":
      updateData.deliveredAt = now;
      break;
    case "cancelled":
      updateData.cancelledAt = now;
      if (cancelReason) updateData.cancelReason = cancelReason;
      break;
  }

  const variantIds = await prisma.$transaction(async (tx) => {
    const affected = await applyOrderStatusInventoryChange(tx, order, status);
    await tx.order.update({
      where: { id },
      data: updateData,
    });
    return affected;
  });

  const updated = await prisma.order.findUnique({ where: { id } });

  if (variantIds.length > 0) {
    await syncLowStockNotificationsForVariants(variantIds);
  }

  return res.json(updated);
});
