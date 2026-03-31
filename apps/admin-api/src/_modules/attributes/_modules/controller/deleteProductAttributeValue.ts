import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../../lib";
import { AuthenticatedRequest } from "../../../../middleware/authMiddleware";

export const deleteProductAttributeValue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { attributeId, valueId } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const value = await prisma.productAttributeValue.findFirst({
    where: {
      id: valueId,
      productAttributeId: attributeId,
      productAttribute: { shopId: { in: shopIds } },
    },
    select: { id: true },
  });

  if (!value) {
    throw new AppError({
      case: "attribute_value",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  // Block deletion if this value is linked to any product variants
  const inUseCount = await prisma.productVariantAttributeValue.count({
    where: { productAttributeValueId: valueId },
  });

  if (inUseCount > 0) {
    throw new AppError({
      case: "attribute_value_in_use",
      code: ERROR_CODES.IN_USE,
      statusCode: 409,
    });
  }

  await prisma.productAttributeValue.delete({
    where: { id: valueId },
  });

  res.status(204).send();
});
