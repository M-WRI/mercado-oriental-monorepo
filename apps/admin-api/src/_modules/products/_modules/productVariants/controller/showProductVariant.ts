import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../../../lib";
import { AuthenticatedRequest } from "../../../../../middleware/authMiddleware";

export const showProductVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: productId, variantId } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const productVariant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      product: { shopId: { in: shopIds } },
    },
    include: {
      productVariantAttributeValues: {
        include: {
          productAttributeValue: {
            include: {
              productAttribute: true,
            }
          }
        },
      },
    },
  });

  if (!productVariant) {
    throw new AppError({
      case: "variant",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  res.json(productVariant);
});
