import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const deleteShop = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

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

  await prisma.shop.delete({
    where: { id },
  });

  res.status(204).send();
});
