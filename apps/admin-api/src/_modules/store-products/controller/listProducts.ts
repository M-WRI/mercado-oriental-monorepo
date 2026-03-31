import { Request, Response } from "express";
import { prisma, asyncHandler, parseListQuery, paginatedResponse } from "../../../lib";

const filterConfig = {
  searchFields: ["name", "description", "shop.name"],
  selectFilters: {
    shopId: { prismaField: "shopId", allowedValues: undefined },
  },
  sortableFields: ["name", "createdAt", "updatedAt"],
  defaultSort: { field: "createdAt" as const, order: "desc" as const },
};

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const parsed = parseListQuery(req.query, filterConfig);

  const where = {
    ...parsed.where,
    isActive: true,
    productVariants: { some: {} },
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: parsed.orderBy,
      skip: parsed.skip,
      take: parsed.take,
      include: {
        shop: { select: { id: true, name: true } },
        productVariants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            reservedStock: true,
            productVariantAttributeValues: {
              include: {
                productAttributeValue: {
                  include: { productAttribute: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const data = products.map((p) => {
    const prices = p.productVariants.map((v) => v.price);
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      shop: p.shop,
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
      variantCount: p.productVariants.length,
      inStock: p.productVariants.some((v) => v.stock - v.reservedStock > 0),
      avgRating,
      reviewCount: p.reviews.length,
      createdAt: p.createdAt,
    };
  });

  return res.json(paginatedResponse(data, total, parsed.page, parsed.limit));
});
