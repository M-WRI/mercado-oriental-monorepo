import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const updateShop = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const data = req.body;

  if (data.name !== undefined && (typeof data.name !== "string" || !data.name.trim())) {
    throw new AppError({
      case: "shop_name",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (
    data.defaultLowStockThreshold !== undefined &&
    (!Number.isInteger(data.defaultLowStockThreshold) ||
      data.defaultLowStockThreshold < 0)
  ) {
    throw new AppError({
      case: "shop_low_stock_threshold",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const existing = await prisma.shop.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError({
      case: "shop",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const shop = await prisma.shop.update({
    where: { id },
    data: {
      name: data.name?.trim(),
      description: data.description !== undefined ? data.description?.trim() || null : undefined,
      defaultLowStockThreshold:
        data.defaultLowStockThreshold !== undefined
          ? data.defaultLowStockThreshold
          : undefined,
    },
  });

  res.json(shop);
});
