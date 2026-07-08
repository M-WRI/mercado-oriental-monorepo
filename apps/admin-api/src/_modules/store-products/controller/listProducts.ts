import { Request, Response } from "express";
import { prisma, asyncHandler, parseListQuery, paginatedResponse } from "../../../lib";
import { getCategoryFilterIds } from "../../store-categories/lib/categoryTree";
import { resolvePrimaryImageUrl } from "../../products/lib/productImages";

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

  const where: Record<string, unknown> = {
    ...parsed.where,
    isActive: true,
    productVariants: { some: {} },
  };

  // Category filter — include selected category and all descendants (products are tagged on leaf nodes)
  const categoryId = req.query.categoryId as string | undefined;
  if (categoryId) {
    const categoryIds = await getCategoryFilterIds(categoryId);
    where.productCategories = { some: { categoryId: { in: categoryIds } } };
  }

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
        productCategories: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        productImages: {
          select: { url: true, isPrimary: true, sortOrder: true },
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
      imageUrl: p.imageUrl ?? resolvePrimaryImageUrl(p.productImages),
      shop: p.shop,
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
      variantCount: p.productVariants.length,
      inStock: p.productVariants.some((v) => v.stock - v.reservedStock > 0),
      avgRating,
      reviewCount: p.reviews.length,
      categories: p.productCategories.map((pc) => pc.category),
      createdAt: p.createdAt,
    };
  });

  return res.json(paginatedResponse(data, total, parsed.page, parsed.limit));
});
