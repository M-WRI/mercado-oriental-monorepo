import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const showDispute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const dispute = await prisma.dispute.findFirst({
    where: { id, order: { shopId: { in: shopIds } } },
    include: {
      order: { select: { id: true, customerEmail: true, customerName: true, status: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!dispute) {
    throw new AppError({
      case: "dispute",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  return res.json(dispute);
});
