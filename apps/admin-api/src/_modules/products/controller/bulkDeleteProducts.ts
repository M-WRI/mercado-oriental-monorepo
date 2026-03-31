import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const bulkDeleteProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError({
      case: "product_ids",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const shopIds = await getShopIdsForUser(req.user!.userId);

  const owned = await prisma.product.findMany({
    where: { id: { in: ids }, shopId: { in: shopIds } },
    select: { id: true },
  });

  const ownedIds = owned.map((p) => p.id);

  if (ownedIds.length === 0) {
    throw new AppError({
      case: "product",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  await prisma.product.deleteMany({
    where: { id: { in: ownedIds } },
  });

  res.status(200).json({ deleted: ownedIds.length });
});
