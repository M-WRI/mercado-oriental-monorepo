import { Response } from "express";
import { prisma, asyncHandler, getShopIdsForUser, resolveScopedShopIds, parseListQuery, paginatedResponse } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { serializeOrderList } from "../serializers";
import { orderListFilter } from "../filters";

export const listOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allShopIds = await getShopIdsForUser(req.user!.userId);
  const shopIds = resolveScopedShopIds(allShopIds, req.query.shopId);

  if (shopIds.length === 0) {
    return res.json(paginatedResponse([], 0, 1, 10));
  }

  const parsed = parseListQuery(req.query, orderListFilter);
  const where = { shopId: { in: shopIds }, ...parsed.where };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: parsed.orderBy,
      skip: parsed.skip,
      take: parsed.take,
      include: {
        orderItems: { select: { id: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return res.json(
    paginatedResponse(serializeOrderList(orders), total, parsed.page, parsed.limit),
  );
});
