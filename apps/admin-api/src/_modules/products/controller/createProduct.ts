import { Response } from "express";
import {
  prisma,
  AppError,
  ERROR_CODES,
  asyncHandler,
  getShopIdsForUser,
  assertShopBelongsToUser,
} from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { validateVariantFields, assertNoAttributeValueDuplicates } from "../validation";

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new AppError({
      case: "product_name",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (!data.shopId || typeof data.shopId !== "string") {
    throw new AppError({
      case: "product_shop",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  assertShopBelongsToUser(data.shopId, shopIds);

  // Validate variant data if provided
  if (data.productVariants?.create) {
    const variants = data.productVariants.create;
    if (!Array.isArray(variants)) {
      throw new AppError({
        case: "product_variants",
        code: ERROR_CODES.INVALID,
        statusCode: 400,
      });
    }

    for (const variant of variants) {
      validateVariantFields(variant);
    }

    for (const variant of variants) {
      const links = variant.productVariantAttributeValues?.create;
      if (!Array.isArray(links) || links.length === 0) {
        throw new AppError({
          case: "variant_attribute_values",
          code: ERROR_CODES.MISSING,
          statusCode: 400,
        });
      }
    }

    const syntheticVariants = variants.map((v: any, i: number) => ({
      id: `new-${i}`,
      productVariantAttributeValues: (v.productVariantAttributeValues?.create ?? []).map(
        (link: any) => ({ productAttributeValueId: link.productAttributeValueId })
      ),
    }));
    assertNoAttributeValueDuplicates(syntheticVariants);
  }

  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
      shopId: data.shopId,
      description: data.description?.trim() || undefined,
      productVariants: data.productVariants?.create
        ? { create: data.productVariants.create }
        : undefined,
    },
  });

  res.status(201).json(product);
});
