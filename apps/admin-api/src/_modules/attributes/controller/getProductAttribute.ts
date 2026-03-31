import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { serializeAttributeDetail } from "../serializers";

export const getProductAttribute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const productAttribute = await prisma.productAttribute.findFirst({
    where: { id, shopId: { in: shopIds } },
    include: {
      productAttributeValues: {
        include: {
          productVariantAttributeValues: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!productAttribute) {
    throw new AppError({
      case: "attribute",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  res.json(serializeAttributeDetail(productAttribute));
});
