import { Request, Response } from "express";
import { prisma, asyncHandler, parseListQuery, paginatedResponse } from "../../../lib";

const filterConfig = {
  searchFields: ["name", "description"],
  selectFilters: {},
  sortableFields: ["name", "createdAt"],
  defaultSort: { field: "name" as const, order: "asc" as const },
};

export const listShops = asyncHandler(async (req: Request, res: Response) => {
  const parsed = parseListQuery(req.query, filterConfig);

  const where = {
    ...parsed.where,
    products: { some: { isActive: true, productVariants: { some: {} } } },
  };

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      orderBy: parsed.orderBy,
      skip: parsed.skip,
      take: parsed.take,
      include: {
        products: {
          where: { isActive: true, productVariants: { some: {} } },
          include: {
            reviews: { select: { rating: true } },
            productVariants: { select: { id: true } },
          },
        },
      },
    }),
    prisma.shop.count({ where }),
  ]);

  const data = shops.map((shop) => {
    const allReviews = shop.products.flatMap((p) => p.reviews);
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : null;

    return {
      id: shop.id,
      name: shop.name,
      description: shop.description,
      productCount: shop.products.length,
      avgRating,
      reviewCount: allReviews.length,
      createdAt: shop.createdAt,
    };
  });

  return res.json(paginatedResponse(data, total, parsed.page, parsed.limit));
});
