import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { notifyNewDispute } from "../../../lib/notifications";

export const createDispute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const { reason } = req.body as { reason?: string };
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

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new AppError({
      case: "dispute_reason",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const existing = await prisma.dispute.findFirst({
    where: { orderId, status: { in: ["open", "under_review"] } },
    select: { id: true },
  });

  if (existing) {
    throw new AppError({
      case: "dispute",
      code: ERROR_CODES.DUPLICATE,
      statusCode: 409,
    });
  }

  const dispute = await prisma.dispute.create({
    data: {
      orderId,
      reason: reason.trim(),
    },
    include: {
      order: { select: { id: true, customerEmail: true, customerName: true, status: true } },
      messages: true,
    },
  });

  notifyNewDispute(orderId, dispute.id, reason.trim()).catch(() => {});

  return res.status(201).json(dispute);
});
