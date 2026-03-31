import { Response } from "express";
import { prisma, asyncHandler } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const markAllNotificationsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  return res.json({ marked: result.count });
});
