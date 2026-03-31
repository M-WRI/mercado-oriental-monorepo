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

export const updateProductAttribute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const owned = await prisma.productAttribute.findFirst({
    where: { id, shopId: { in: shopIds } },
    select: { id: true },
  });

  if (!owned) {
    throw new AppError({
      case: "attribute",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (data.shopId !== undefined) {
    assertShopBelongsToUser(data.shopId, shopIds);
  }

  if (data.name !== undefined && (typeof data.name !== "string" || !data.name.trim())) {
    throw new AppError({
      case: "attribute_name",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (data.productAttributeValues !== undefined && !Array.isArray(data.productAttributeValues)) {
    throw new AppError({
      case: "attribute_values",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (Array.isArray(data.productAttributeValues)) {
    for (const val of data.productAttributeValues) {
      if (!val.value || typeof val.value !== "string" || !val.value.trim()) {
        throw new AppError({
          case: "attribute_value_empty",
          code: ERROR_CODES.INVALID,
          statusCode: 400,
        });
      }
    }
  }

  const productAttribute = await prisma.productAttribute.update({
    where: { id },
    data: {
      name: data.name?.trim(),
      description: data.description?.trim(),
      shopId: data.shopId,
      productAttributeValues: {
        deleteMany: {},
        create: (data.productAttributeValues ?? []).map(
          (v: { value: string }) => ({ value: v.value.trim() })
        ),
      },
    },
  });

  res.json(productAttribute);
});
