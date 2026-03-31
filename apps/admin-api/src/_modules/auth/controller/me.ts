import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError({
      case: "user",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  res.status(200).json(user);
});
