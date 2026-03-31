import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const createShop = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const userId = req.user!.userId;

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    throw new AppError({
      case: "shop_name",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const shop = await prisma.shop.create({
    data: {
      userId,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      products: data.products?.create ? { create: data.products.create } : undefined,
      attributes: data.attributes?.create ? { create: data.attributes.create } : undefined,
    },
  });

  res.status(201).json(shop);
});
