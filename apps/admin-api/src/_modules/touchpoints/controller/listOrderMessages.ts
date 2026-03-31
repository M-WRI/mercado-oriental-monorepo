import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listOrderMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const order = await prisma.order.findFirst({
    where: { id: orderId, shopId: { in: shopIds } },
    select: { id: true },
  });

  if (!order) {
    throw new AppError({
      case: "order",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const messages = await prisma.orderMessage.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return res.json(messages);
});
