import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { INV_REASON, recordMovement, syncLowStockNotificationsForVariants } from "../../../lib/inventory";

export const restockOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { items } = req.body as { items: { orderItemId: string; quantity: number }[] };
  const shopIds = await getShopIdsForUser(req.user!.userId);

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError({
      case: "restock_items",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

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

  if (order.status !== "delivered") {
    throw new AppError({
      case: "order_restock",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const touched = await prisma.$transaction(async (tx) => {
    const variantIds: string[] = [];
    for (const row of items) {
      if (!row.orderItemId || typeof row.quantity !== "number" || row.quantity <= 0) {
        throw new AppError({
          case: "restock_items",
          code: ERROR_CODES.INVALID,
          statusCode: 400,
        });
      }
      const line = order.orderItems.find((l) => l.id === row.orderItemId);
      if (!line || !line.productVariantId) {
        throw new AppError({
          case: "order_item",
          code: ERROR_CODES.NOT_FOUND,
          statusCode: 404,
        });
      }
      if (row.quantity > line.quantity) {
        throw new AppError({
          case: "restock_quantity",
          code: ERROR_CODES.INVALID,
          statusCode: 400,
        });
      }
      await tx.productVariant.update({
        where: { id: line.productVariantId },
        data: { stock: { increment: row.quantity } },
      });
      await recordMovement(tx, {
        productVariantId: line.productVariantId,
        stockDelta: row.quantity,
        reservedDelta: 0,
        reason: INV_REASON.RETURN,
        orderId: order.id,
        userId: req.user!.userId,
        note: `Return for order item ${line.id}`,
      });
      variantIds.push(line.productVariantId);
    }
    return [...new Set(variantIds)];
  });

  await syncLowStockNotificationsForVariants(touched);

  return res.status(200).json({ restocked: true, variantIds: touched });
});
