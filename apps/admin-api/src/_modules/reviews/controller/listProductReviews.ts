import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listProductReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const product = await prisma.product.findFirst({
    where: { id: productId, shopId: { in: shopIds } },
    select: { id: true },
  });

  if (!product) {
    throw new AppError({ case: "product", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const reviews = await prisma.productReview.findMany({
    where: { productId },
    include: { reply: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json(reviews);
});
