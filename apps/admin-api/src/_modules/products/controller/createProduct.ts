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
import { assertNoAttributeValueDuplicates } from "../validation";

import type { z } from "zod";

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as z.infer<typeof import("@mercado/shared-types").CreateProductRequestBody>;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  assertShopBelongsToUser(data.shopId, shopIds);

  // Variants are already validated, but we still construct synthetic instances
  // against the assertNoAttributeValueDuplicates logic or just remove that too?
  // Let's keep logic that's not strictly typing (like no duplicate attribute value sets)
  if (data.productVariants?.create) {
    const syntheticVariants = data.productVariants.create.map((v: any, i: number) => ({
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
