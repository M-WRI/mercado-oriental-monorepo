import { Response } from "express";
import { prisma, asyncHandler } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return res.json(rows);
});
