import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { INV_REASON, recordMovement, syncLowStockNotificationsForVariants } from "../../../lib/inventory";

const ALLOWED = new Set<string>([INV_REASON.ADJUSTMENT, INV_REASON.DAMAGE]);

export const adjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const shopIds = await getShopIdsForUser(req.user!.userId);
  const { variantId, stockDelta, reason, note } = req.body as {
    variantId?: string;
    stockDelta?: number;
    reason?: string;
    note?: string;
  };

  if (!variantId || typeof stockDelta !== "number" || !Number.isFinite(stockDelta) || stockDelta === 0) {
    throw new AppError({
      case: "inventory_adjust",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (!reason || typeof reason !== "string" || !ALLOWED.has(reason)) {
    throw new AppError({
      case: "inventory_adjust",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { shopId: { in: shopIds } } },
    select: { id: true, stock: true, reservedStock: true },
  });

  if (!variant) {
    throw new AppError({
      case: "variant",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const newStock = variant.stock + stockDelta;
  if (newStock < 0 || newStock < variant.reservedStock) {
    throw new AppError({
      case: "inventory_availability",
      code: ERROR_CODES.INVALID,
      statusCode: 409,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });
    await recordMovement(tx, {
      productVariantId: variantId,
      stockDelta,
      reservedDelta: 0,
      reason,
      userId: req.user!.userId,
      note: note ?? null,
    });
  });

  await syncLowStockNotificationsForVariants([variantId]);

  const updated = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, stock: true, reservedStock: true },
  });

  return res.json(updated);
});
