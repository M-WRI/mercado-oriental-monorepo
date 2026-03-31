import { Response } from "express";
import { prisma, asyncHandler } from "../../../lib";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listShop = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const shops = await prisma.shop.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(shops);
});
