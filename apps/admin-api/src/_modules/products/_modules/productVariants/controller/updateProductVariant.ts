import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../../../lib";
import { syncLowStockNotificationsForVariants } from "../../../../../lib/inventory";
import { AuthenticatedRequest } from "../../../../../middleware/authMiddleware";

export const updateProductVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id: productId, variantId } = req.params;
  const data = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const existing = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      product: { shopId: { in: shopIds } },
    },
    select: { id: true, reservedStock: true },
  });

  if (!existing) {
    throw new AppError({
      case: "variant",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (data.productId !== undefined) {
    const target = await prisma.product.findFirst({
      where: { id: data.productId, shopId: { in: shopIds } },
      select: { id: true },
    });
    if (!target) {
      throw new AppError({
        case: "product",
        code: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }
  }

  if (data.name !== undefined && (typeof data.name !== "string" || !data.name.trim())) {
    throw new AppError({
      case: "variant_name",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (data.price !== undefined && (typeof data.price !== "number" || data.price < 0)) {
    throw new AppError({
      case: "variant_price",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (data.stock !== undefined && (typeof data.stock !== "number" || data.stock < 0)) {
    throw new AppError({
      case: "variant_stock",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (data.stock !== undefined && existing && data.stock < existing.reservedStock) {
    throw new AppError({
      case: "variant_stock_reserved",
      code: ERROR_CODES.INVALID,
      statusCode: 409,
    });
  }

  const productVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name: data.name?.trim(),
      price: data.price,
      stock: data.stock,
      productId: data.productId,
      productVariantAttributeValues: data.productVariantAttributeValues?.update
        ? { update: data.productVariantAttributeValues.update }
        : data.productVariantAttributeValues?.updateMany
          ? { updateMany: data.productVariantAttributeValues.updateMany }
          : undefined,
    },
  });

  if (data.stock !== undefined) {
    await syncLowStockNotificationsForVariants([variantId]);
  }

  res.json(productVariant);
});
