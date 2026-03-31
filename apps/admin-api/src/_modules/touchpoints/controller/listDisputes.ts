import { Response } from "express";
import { prisma, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listDisputes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const shopIds = await getShopIdsForUser(req.user!.userId);
  const { status, orderId } = req.query as { status?: string; orderId?: string };

  const where: Record<string, unknown> = {
    order: { shopId: { in: shopIds } },
  };

  if (status) {
    where.status = status;
  }
  if (orderId) {
    where.orderId = orderId;
  }

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      order: { select: { id: true, customerEmail: true, customerName: true, status: true } },
      messages: { orderBy: { createdAt: "asc" } },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(disputes);
});
