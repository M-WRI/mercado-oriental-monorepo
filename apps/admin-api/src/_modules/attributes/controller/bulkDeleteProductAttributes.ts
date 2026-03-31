import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const bulkDeleteProductAttributes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError({
      case: "attribute_ids",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const shopIds = await getShopIdsForUser(req.user!.userId);

  const owned = await prisma.productAttribute.findMany({
    where: { id: { in: ids }, shopId: { in: shopIds } },
    select: { id: true },
  });

  const ownedIds = owned.map((a) => a.id);

  if (ownedIds.length === 0) {
    throw new AppError({
      case: "attribute",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const inUseCount = await prisma.productVariantAttributeValue.count({
    where: {
      productAttributeValue: {
        productAttributeId: { in: ownedIds },
      },
    },
  });

  if (inUseCount > 0) {
    throw new AppError({
      case: "attribute_in_use",
      code: ERROR_CODES.IN_USE,
      statusCode: 409,
    });
  }

  await prisma.productAttribute.deleteMany({
    where: { id: { in: ownedIds } },
  });

  res.status(200).json({ deleted: ownedIds.length });
});
