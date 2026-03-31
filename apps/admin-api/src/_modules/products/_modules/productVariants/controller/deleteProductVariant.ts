import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../../../lib";
import { AuthenticatedRequest } from "../../../../../middleware/authMiddleware";

export const deleteProductVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: productId, variantId } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const existing = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      product: { shopId: { in: shopIds } },
    },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError({
      case: "variant",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  await prisma.productVariant.delete({
    where: { id: variantId },
  });

  res.status(204).send();
});
