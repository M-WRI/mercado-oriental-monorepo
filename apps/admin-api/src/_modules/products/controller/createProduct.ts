import { Response } from "express";
import {
  prisma,
  asyncHandler,
  getShopIdsForUser,
  assertShopBelongsToUser,
} from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { assertNoAttributeValueDuplicates } from "../validation";
import { replaceProductImages } from "../lib/productImages";

import type { z } from "zod";

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as z.infer<typeof import("@mercado/shared-types").CreateProductRequestBody>;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  assertShopBelongsToUser(data.shopId, shopIds);

  if (data.productVariants?.create) {
    const syntheticVariants = data.productVariants.create.map((v: any, i: number) => ({
      id: `new-${i}`,
      productVariantAttributeValues: (v.productVariantAttributeValues?.create ?? []).map(
        (link: any) => ({ productAttributeValueId: link.productAttributeValueId })
      ),
    }));
    assertNoAttributeValueDuplicates(syntheticVariants);
  }

  const legacyImageUrl =
    data.imageUrl === undefined
      ? undefined
      : data.imageUrl?.trim() || null;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: data.name.trim(),
        shopId: data.shopId,
        description: data.description?.trim() || undefined,
        imageUrl: legacyImageUrl,
        productVariants: data.productVariants?.create
          ? { create: data.productVariants.create }
          : undefined,
      },
      include: {
        productVariants: { select: { id: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (data.images?.length) {
      const variantIds = created.productVariants.map((v) => v.id);
      await replaceProductImages(tx, created.id, data.images, variantIds);
    } else if (legacyImageUrl) {
      await tx.productImage.create({
        data: {
          url: legacyImageUrl,
          sortOrder: 0,
          isPrimary: true,
          productId: created.id,
        },
      });
    }

    return created;
  });

  // Link categories if provided
  const categoryIds: string[] = (req.body as any).categoryIds ?? [];
  if (categoryIds.length > 0) {
    await prisma.productCategory.createMany({
      data: categoryIds.map((catId: string) => ({
        productId: product.id,
        categoryId: catId,
      })),
      skipDuplicates: true,
    });
  }

  const result = await prisma.product.findUnique({
    where: { id: product.id },
    include: { productImages: true },
  });

  res.status(201).json(result);
});

