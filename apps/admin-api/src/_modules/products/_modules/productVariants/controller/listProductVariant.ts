import { Response } from "express";
import { prisma, asyncHandler, getShopIdsForUser } from "../../../../../lib";
import { AuthenticatedRequest } from "../../../../../middleware/authMiddleware";

export const listProductVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: productId } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const productVariants = await prisma.productVariant.findMany({
    where: {
      productId,
      product: { shopId: { in: shopIds } },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      productVariantAttributeValues: {
        include: {
          productAttributeValue: {
            include: {
              productAttribute: true,
            },
          },
        },
      },
    },
  });

  res.json(productVariants);
});
