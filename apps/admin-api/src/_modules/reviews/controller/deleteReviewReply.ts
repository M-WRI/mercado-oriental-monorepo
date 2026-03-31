import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const deleteReviewReply = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const review = await prisma.productReview.findFirst({
    where: { id, product: { shopId: { in: shopIds } } },
    include: { reply: { select: { id: true } } },
  });

  if (!review) {
    throw new AppError({ case: "review", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  if (!review.reply) {
    throw new AppError({ case: "review_reply", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  await prisma.reviewReply.delete({ where: { id: review.reply.id } });

  return res.status(204).send();
});
