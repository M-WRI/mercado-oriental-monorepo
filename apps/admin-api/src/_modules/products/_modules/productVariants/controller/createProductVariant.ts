import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../../../lib";
import { AuthenticatedRequest } from "../../../../../middleware/authMiddleware";
import { assertNoAttributeValueDuplicates } from "../../../validation";

export const createProductVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: productId } = req.params;
  const data = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const product = await prisma.product.findFirst({
    where: { id: productId, shopId: { in: shopIds } },
    select: { id: true },
  });

  if (!product) {
    throw new AppError({
      case: "product",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new AppError({
      case: "variant_name",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (data.price == null || typeof data.price !== "number") {
    throw new AppError({
      case: "variant_price",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (data.price < 0) {
    throw new AppError({
      case: "variant_price",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (data.stock != null && (typeof data.stock !== "number" || data.stock < 0)) {
    throw new AppError({
      case: "variant_stock",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const newLinks = data.productVariantAttributeValues?.create ?? [];

  if (!Array.isArray(newLinks) || newLinks.length === 0) {
    throw new AppError({
      case: "variant_attribute_values",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId },
    include: {
      productVariantAttributeValues: {
        select: { productAttributeValueId: true },
      },
    },
  });

  const syntheticNew = {
    id: "new-candidate",
    productVariantAttributeValues: newLinks.map((link: any) => ({
      productAttributeValueId: link.productAttributeValueId,
    })),
  };

  assertNoAttributeValueDuplicates([...existingVariants, syntheticNew]);

  const productVariant = await prisma.productVariant.create({
    data: {
      name: data.name.trim(),
      price: data.price,
      stock: data.stock ?? 0,
      productId,
      productVariantAttributeValues: { create: newLinks },
    },
  });

  res.status(201).json(productVariant);
});
