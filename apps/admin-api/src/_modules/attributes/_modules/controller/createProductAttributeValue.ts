import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../../lib";
import { AuthenticatedRequest } from "../../../../middleware/authMiddleware";

export const createProductAttributeValue = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { attributeId } = req.params;
    const { value } = req.body as { value?: string };
    const shopIds = await getShopIdsForUser(req.user!.userId);

    if (!value || typeof value !== "string" || !value.trim()) {
      throw new AppError({
        case: "attribute_value_empty",
        code: ERROR_CODES.MISSING,
        statusCode: 400,
      });
    }

    const attribute = await prisma.productAttribute.findFirst({
      where: { id: attributeId, shopId: { in: shopIds } },
      select: { id: true },
    });

    if (!attribute) {
      throw new AppError({
        case: "attribute",
        code: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    const trimmed = value.trim();
    const duplicate = await prisma.productAttributeValue.findFirst({
      where: { productAttributeId: attributeId, value: trimmed },
      select: { id: true },
    });

    if (duplicate) {
      throw new AppError({
        case: "attribute_value_duplicate",
        code: ERROR_CODES.DUPLICATE,
        statusCode: 409,
      });
    }

    const created = await prisma.productAttributeValue.create({
      data: {
        productAttributeId: attributeId,
        value: trimmed,
      },
    });

    res.status(201).json(created);
  }
);
