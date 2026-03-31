import { Request, Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";

export const showProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: {
      shop: { select: { id: true, name: true } },
      productVariants: {
        include: {
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
        include: {
          reply: { select: { body: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    throw new AppError({
      case: "product",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const variants = product.productVariants.map((v) => {
    const available = v.stock - v.reservedStock;
    const attributes = v.productVariantAttributeValues.map((pav) => ({
      attributeId: pav.productAttributeValue.productAttribute.id,
      attributeName: pav.productAttributeValue.productAttribute.name,
      valueId: pav.productAttributeValue.id,
      value: pav.productAttributeValue.value,
    }));
    return {
      id: v.id,
      name: v.name,
      price: v.price,
      available,
      inStock: available > 0,
      attributes,
    };
  });

  const reviews = product.reviews.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    reply: r.reply,
    createdAt: r.createdAt,
  }));

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    shop: product.shop,
    variants,
    reviews,
    avgRating,
    reviewCount: reviews.length,
    createdAt: product.createdAt,
  });
});
