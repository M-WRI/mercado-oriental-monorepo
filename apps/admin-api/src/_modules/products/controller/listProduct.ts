import { Response } from "express";
import { prisma, asyncHandler, getShopIdsForUser, parseListQuery, paginatedResponse } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { serializeProductList } from "../serializers";
import { productListFilter } from "../filters";

export const listProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const shopIds = await getShopIdsForUser(req.user!.userId);

  if (shopIds.length === 0) {
    return res.json(paginatedResponse([], 0, 1, 10));
  }

  const parsed = parseListQuery(req.query, productListFilter);

  const baseWhere: Record<string, unknown> = { shopId: { in: shopIds } };

  // Boolean coercion for isActive select filter
  if (typeof parsed.where.isActive === "string") {
    baseWhere.isActive = parsed.where.isActive === "true";
    delete parsed.where.isActive;
  }

  const where = { ...baseWhere, ...parsed.where };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: parsed.orderBy,
      skip: parsed.skip,
      take: parsed.take,
      include: {
        shop: { select: { defaultLowStockThreshold: true } },
        productVariants: {
          include: {
            orderItems: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return res.json(
    paginatedResponse(serializeProductList(products), total, parsed.page, parsed.limit),
  );
});
