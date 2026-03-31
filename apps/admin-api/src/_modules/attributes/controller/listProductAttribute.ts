import { Response } from "express";
import {
  prisma,
  AppError,
  ERROR_CODES,
  asyncHandler,
  getShopIdsForUser,
  assertShopBelongsToUser,
} from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listProductAttribute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const shopIds = await getShopIdsForUser(req.user!.userId);

  if (shopIds.length === 0) {
    return res.json([]);
  }

  const { shopId } = req.query;

  if (shopId) {
    if (typeof shopId !== "string") {
      throw new AppError({
        case: "attribute_shop",
        code: ERROR_CODES.INVALID,
        statusCode: 400,
      });
    }
    assertShopBelongsToUser(shopId, shopIds);
  }

  const productAttributes = await prisma.productAttribute.findMany({
    where: shopId
      ? { shopId: shopId as string }
      : { shopId: { in: shopIds } },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      productAttributeValues: true,
    },
  });

  return res.json(productAttributes);
});
