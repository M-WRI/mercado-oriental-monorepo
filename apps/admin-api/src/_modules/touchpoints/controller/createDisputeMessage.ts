import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { isValidSender } from "../validation";

export const createDisputeMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { sender, body } = req.body as { sender?: string; body?: string };
  const shopIds = await getShopIdsForUser(req.user!.userId);

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

  if (dispute.status === "closed") {
    throw new AppError({
      case: "dispute_closed",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
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

  const message = await prisma.disputeMessage.create({
    data: {
      disputeId: id,
      sender,
      body: body.trim(),
    },
  });

  return res.status(201).json(message);
});
