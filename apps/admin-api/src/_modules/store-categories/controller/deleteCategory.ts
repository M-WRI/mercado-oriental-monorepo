import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const deleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError({
      case: "category",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  await prisma.category.delete({ where: { id } });

  res.status(204).send();
});
