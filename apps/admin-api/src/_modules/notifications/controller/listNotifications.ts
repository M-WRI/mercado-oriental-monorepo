import { Response } from "express";
import { prisma, asyncHandler, getShopIdsForUser, resolveScopedShopIds } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { filterNotificationsByShop } from "../lib/filterByShop";

export const listNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const allShopIds = await getShopIdsForUser(userId);
  const shopIds = resolveScopedShopIds(allShopIds, req.query.shopId);

  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (shopIds.length === 1 && allShopIds.length > 0) {
    const scoped = await filterNotificationsByShop(rows, shopIds[0]);
    return res.json(scoped);
  }

  return res.json(rows);
});
