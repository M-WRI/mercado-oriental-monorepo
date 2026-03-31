import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const markNotificationRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError({
      case: "notification",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return res.json(updated);
});
