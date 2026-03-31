import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listMovements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const shopIds = await getShopIdsForUser(req.user!.userId);
  const { variantId } = req.query;

  if (!variantId || typeof variantId !== "string") {
    throw new AppError({
      case: "inventory_movements",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const owned = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { shopId: { in: shopIds } } },
    select: { id: true },
  });

  if (!owned) {
    throw new AppError({
      case: "variant",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const rows = await prisma.inventoryMovement.findMany({
    where: { productVariantId: variantId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return res.json(rows);
});
