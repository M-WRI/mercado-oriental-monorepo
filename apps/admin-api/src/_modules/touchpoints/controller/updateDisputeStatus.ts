import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { isValidDisputeStatus, isValidDisputeTransition } from "../validation";
import { notifyDisputeStatusChange } from "../../../lib/notifications";

export const updateDisputeStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  const shopIds = await getShopIdsForUser(req.user!.userId);

  if (!isValidDisputeStatus(status)) {
    throw new AppError({
      case: "dispute_status",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const dispute = await prisma.dispute.findFirst({
    where: { id, order: { shopId: { in: shopIds } } },
    select: { id: true, status: true },
  });

  if (!dispute) {
    throw new AppError({
      case: "dispute",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (!isValidDisputeTransition(dispute.status, status)) {
    throw new AppError({
      case: "dispute_transition",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const resolvedAt = status === "resolved" ? new Date() : undefined;

  const updated = await prisma.dispute.update({
    where: { id },
    data: { status, resolvedAt },
    include: {
      order: { select: { id: true, customerEmail: true, customerName: true, status: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  notifyDisputeStatusChange(updated.order.id, id, dispute.status, status).catch(() => {});

  return res.json(updated);
});
