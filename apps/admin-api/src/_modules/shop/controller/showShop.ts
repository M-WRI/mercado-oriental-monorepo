import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const showShop = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const shop = await prisma.shop.findFirst({
    where: { id, userId },
  });

  if (!shop) {
    throw new AppError({
      case: "shop",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  res.json(shop);
});
