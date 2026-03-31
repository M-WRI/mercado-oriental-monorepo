import { Response } from "express";
import {
  prisma,
  AppError,
  ERROR_CODES,
  asyncHandler,
  getShopIdsForUser,
} from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import {
  serializeVariantStats,
  serializeSalesPerformance,
  serializeCustomerInsights,
} from "../serializers";

export const showProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const product = await prisma.product.findFirst({
    where: { id, shopId: { in: shopIds } },
    include: {
      shop: {
        select: { id: true, name: true, defaultLowStockThreshold: true },
      },
      productVariants: {
        include: {
          productVariantAttributeValues: {
            include: {
              productAttributeValue: {
                include: {
                  productAttribute: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
          orderItems: {
            include: {
              order: {
                select: {
                  id: true,
                  customerEmail: true,
                  customerName: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new AppError({
      case: "product",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const now = new Date();
  const productAge = Math.floor(
    (now.getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const { stats: variantStats, accumulator } = serializeVariantStats(
    product.productVariants,
    now,
    product.shop.defaultLowStockThreshold
  );

  const sales = serializeSalesPerformance(accumulator, variantStats, now);
  const customers = serializeCustomerInsights(accumulator);

  res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    isActive: product.isActive,
    shop: product.shop,
    createdAt: product.createdAt,
    analytics: {
      totalStock: accumulator.totalAvailable,
      totalStockOnHand: accumulator.totalStock,
      totalReserved: accumulator.totalReserved,
      totalStockValue: accumulator.totalStockValue,
      outOfStockCount: accumulator.outOfStockCount,
      lowStockCount: accumulator.lowStockCount,
      lowStockThreshold: product.shop.defaultLowStockThreshold,
      totalSold: sales.totalSold,
      totalRevenue: sales.totalRevenue,
      avgSellingPrice: sales.avgSellingPrice,
      salesVelocity: sales.salesVelocity,
      salesTimeline: sales.salesTimeline,
      thisWeek: sales.weekly.thisWeek,
      lastWeek: sales.weekly.lastWeek,
      revenueChangePercent: sales.weekly.revenueChangePercent,
      unitsChangePercent: sales.weekly.unitsChangePercent,
      productAge,
      daysSinceLastSale: sales.daysSinceLastSale,
      bestVariant: sales.bestVariant,
      worstVariant: sales.worstVariant,
      totalCustomers: customers.totalCustomers,
      repeatBuyerCount: customers.repeatBuyerCount,
      topBuyer: customers.topBuyer,
      customers: customers.customers,
    },
    variants: variantStats,
  });
});
