import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { INV_REASON, recordMovement, syncLowStockNotificationsForVariants } from "../../../lib/inventory";

export const bulkAdjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const shopIds = await getShopIdsForUser(req.user!.userId);
  const { items } = req.body as { items: { variantId: string; stockDelta: number; note?: string }[] };

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError({
      case: "inventory_bulk",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const touched = await prisma.$transaction(async (tx) => {
    const variantIds: string[] = [];
    for (const row of items) {
      if (!row.variantId || typeof row.stockDelta !== "number" || !Number.isFinite(row.stockDelta) || row.stockDelta === 0) {
        throw new AppError({
          case: "inventory_bulk",
          code: ERROR_CODES.INVALID,
          statusCode: 400,
        });
      }
      const variant = await tx.productVariant.findFirst({
        where: { id: row.variantId, product: { shopId: { in: shopIds } } },
        select: { id: true, stock: true, reservedStock: true },
      });
      if (!variant) {
        throw new AppError({
          case: "variant",
          code: ERROR_CODES.NOT_FOUND,
          statusCode: 404,
        });
      }
      const newStock = variant.stock + row.stockDelta;
      if (newStock < 0 || newStock < variant.reservedStock) {
        throw new AppError({
          case: "inventory_availability",
          code: ERROR_CODES.INVALID,
          statusCode: 409,
        });
      }
      await tx.productVariant.update({
        where: { id: row.variantId },
        data: { stock: newStock },
      });
      await recordMovement(tx, {
        productVariantId: row.variantId,
        stockDelta: row.stockDelta,
        reservedDelta: 0,
        reason: INV_REASON.BULK_ADJUST,
        userId: req.user!.userId,
        note: row.note ?? null,
      });
      variantIds.push(row.variantId);
    }
    return [...new Set(variantIds)];
  });

  await syncLowStockNotificationsForVariants(touched);

  return res.json({ updated: touched.length });
});
