import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const deleteProductAttribute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const owned = await prisma.productAttribute.findFirst({
    where: { id, shopId: { in: shopIds } },
    select: { id: true },
  });

  if (!owned) {
    throw new AppError({
      case: "attribute",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  // Block deletion if any attribute values are linked to product variants
  const inUseCount = await prisma.productVariantAttributeValue.count({
    where: {
      productAttributeValue: {
        productAttributeId: id,
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

  await prisma.productAttribute.delete({
    where: { id },
  });

  res.status(204).send();
});
