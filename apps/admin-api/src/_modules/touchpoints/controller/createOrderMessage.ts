import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { isValidSender } from "../validation";
import { notifyNewMessage } from "../../../lib/notifications";

export const createOrderMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const { sender, body } = req.body as { sender?: string; body?: string };
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

  if (!isValidSender(sender)) {
    throw new AppError({
      case: "message_sender",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (!body || typeof body !== "string" || !body.trim()) {
    throw new AppError({
      case: "message_body",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const message = await prisma.orderMessage.create({
    data: {
      orderId,
      sender,
      body: body.trim(),
    },
  });

  if (sender === "customer") {
    notifyNewMessage(orderId, "Customer").catch(() => {});
  }

  return res.status(201).json(message);
});
