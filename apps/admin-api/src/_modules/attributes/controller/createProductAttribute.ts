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

export const createProductAttribute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new AppError({
      case: "attribute_name",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (!data.shopId || typeof data.shopId !== "string") {
    throw new AppError({
      case: "attribute_shop",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (!Array.isArray(data.productAttributeValues)) {
    throw new AppError({
      case: "attribute_values",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  for (const val of data.productAttributeValues) {
    if (!val.value || typeof val.value !== "string" || !val.value.trim()) {
      throw new AppError({
        case: "attribute_value_empty",
        code: ERROR_CODES.INVALID,
        statusCode: 400,
      });
    }
  }

  assertShopBelongsToUser(data.shopId, shopIds);

  const productAttribute = await prisma.productAttribute.create({
    data: {
      name: data.name.trim(),
      shopId: data.shopId,
      description: data.description?.trim() || undefined,
      productAttributeValues: {
        create: data.productAttributeValues.map((value: { value: string }) => ({
          value: value.value.trim(),
        })),
      },
    },
    include: {
      productAttributeValues: true,
    },
  });

  res.status(201).json(productAttribute);
});
