import { Response } from "express";
import { prisma, asyncHandler, getShopIdsForUser, resolveScopedShopIds } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const listDisputes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allShopIds = await getShopIdsForUser(req.user!.userId);
  const shopIds = resolveScopedShopIds(allShopIds, req.query.shopId);
  const { status, orderId } = req.query as { status?: string; orderId?: string };

  if (shopIds.length === 0) {
    return res.json([]);
  }

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
