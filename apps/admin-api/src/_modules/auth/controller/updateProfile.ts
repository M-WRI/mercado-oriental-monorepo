import { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { name, currentPassword, newPassword } = req.body as {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  if (name === undefined && newPassword === undefined) {
    throw new AppError({
      case: "profile_update",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, password: true },
  });

  if (!user) {
    throw new AppError({
      case: "user",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    throw new AppError({
      case: "profile_name",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (newPassword !== undefined) {
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      throw new AppError({
        case: "profile_password",
        code: ERROR_CODES.INVALID,
        statusCode: 400,
      });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new AppError({
        case: "profile_current_password",
        code: ERROR_CODES.INVALID,
        statusCode: 401,
      });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(newPassword !== undefined && {
        password: await bcrypt.hash(newPassword, 10),
      }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  res.json(updated);
});
