import { Request, Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";

export const showShop = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const shop = await prisma.shop.findFirst({
    where: { id },
    include: {
      products: {
        where: { isActive: true, productVariants: { some: {} } },
        include: {
          productVariants: {
            select: {
              id: true,
              price: true,
              stock: true,
              reservedStock: true,
            },
          },
          reviews: { select: { rating: true } },
          productCategories: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!shop) {
    throw new AppError({
      case: "shop",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const allReviews = shop.products.flatMap((p) => p.reviews);
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : null;

  const products = shop.products.map((p) => {
    const prices = p.productVariants.map((v) => v.price);
    const productReviews = p.reviews;
    const productAvgRating =
      productReviews.length > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
        : null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
      variantCount: p.productVariants.length,
      inStock: p.productVariants.some((v) => v.stock - v.reservedStock > 0),
      avgRating: productAvgRating,
      reviewCount: productReviews.length,
      categories: p.productCategories.map((pc) => pc.category),
      createdAt: p.createdAt,
    };
  });

  return res.json({
    id: shop.id,
    name: shop.name,
    description: shop.description,
    productCount: products.length,
    avgRating,
    reviewCount: allReviews.length,
    memberSince: shop.createdAt,
    products,
  });
});
