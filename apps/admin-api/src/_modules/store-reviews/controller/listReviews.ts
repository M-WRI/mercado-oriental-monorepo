import { Response } from "express";
import { prisma, asyncHandler, parseListQuery, paginatedResponse } from "../../../lib";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

const filterConfig = {
  searchFields: [] as string[],
  selectFilters: {},
  sortableFields: ["createdAt", "rating"],
  defaultSort: { field: "createdAt" as const, order: "desc" as const },
};

export const listReviews = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer!.customerId;
  const parsed = parseListQuery(req.query, filterConfig);
  const where = { ...parsed.where, customerId };

  const [reviews, total] = await Promise.all([
    prisma.productReview.findMany({
      where,
      orderBy: parsed.orderBy,
      skip: parsed.skip,
      take: parsed.take,
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
        reply: { select: { body: true, createdAt: true } },
      },
    }),
    prisma.productReview.count({ where }),
  ]);

  const data = reviews.map((review) => ({
    id: review.id,
    productId: review.productId,
    product: review.product,
    rating: review.rating,
    title: review.title,
    body: review.body,
    reply: review.reply,
    createdAt: review.createdAt,
  }));

  return res.json(paginatedResponse(data, total, parsed.page, parsed.limit));
});
