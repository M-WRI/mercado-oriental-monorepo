import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const replyToReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { body } = req.body as { body?: string };
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const review = await prisma.productReview.findFirst({
    where: { id, product: { shopId: { in: shopIds } } },
    include: { reply: { select: { id: true } } },
  });

  if (!review) {
    throw new AppError({ case: "review", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  if (!body || typeof body !== "string" || !body.trim()) {
    throw new AppError({ case: "review_reply_body", code: ERROR_CODES.MISSING, statusCode: 400 });
  }

  if (review.reply) {
    // Update existing reply
    const updated = await prisma.reviewReply.update({
      where: { id: review.reply.id },
      data: { body: body.trim() },
    });
    return res.json(updated);
  }

  const reply = await prisma.reviewReply.create({
    data: {
      reviewId: id,
      body: body.trim(),
    },
  });

  return res.status(201).json(reply);
});
