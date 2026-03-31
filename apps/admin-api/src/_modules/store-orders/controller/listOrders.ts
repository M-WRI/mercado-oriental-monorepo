import { Response } from "express";
import { prisma, asyncHandler, parseListQuery, paginatedResponse } from "../../../lib";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

const filterConfig = {
  searchFields: [] as string[],
  selectFilters: {
    status: {
      prismaField: "status",
      allowedValues: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
    },
  },
  sortableFields: ["createdAt", "totalAmount"],
  defaultSort: { field: "createdAt" as const, order: "desc" as const },
};

export const listOrders = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer!.customerId;
  const parsed = parseListQuery(req.query, filterConfig);

  const where = { ...parsed.where, customerId };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: parsed.orderBy,
      skip: parsed.skip,
      take: parsed.take,
      include: {
        shop: { select: { id: true, name: true } },
        orderItems: { select: { id: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const data = orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: o.totalAmount,
    itemCount: o.orderItems.length,
    shop: o.shop,
    shippingAddress: o.shippingAddress,
    trackingNumber: o.trackingNumber,
    carrier: o.carrier,
    createdAt: o.createdAt,
  }));

  return res.json(paginatedResponse(data, total, parsed.page, parsed.limit));
});
