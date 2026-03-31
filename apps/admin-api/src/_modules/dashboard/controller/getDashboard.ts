import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { prisma, asyncHandler } from "../../../lib";
import {
  serializeSalesSnapshot,
  serializeRevenueTimeline,
  serializeWeeklyComparison,
  serializeRecentOrders,
  serializeInventoryAlerts,
  serializeTopProducts,
  serializeCustomerStats,
} from "../serializers";

export const getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const shops = await prisma.shop.findMany({
    where: { userId },
    select: { id: true },
  });
  const shopIds = shops.map((s) => s.id);

  if (shopIds.length === 0) {
    return res.json(emptyDashboard());
  }

  // ── Date boundaries ───────────────────────────────────────────
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // ── Fetch all data in parallel ────────────────────────────────
  const [allOrders, allVariants, totalProducts, totalAttributes] =
    await Promise.all([
      prisma.order.findMany({
        where: { shopId: { in: shopIds } },
        include: {
          orderItems: {
            include: {
              productVariant: {
                include: { product: { select: { id: true, name: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.productVariant.findMany({
        where: { product: { shopId: { in: shopIds } } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              shop: { select: { defaultLowStockThreshold: true } },
            },
          },
        },
      }),
      prisma.product.count({ where: { shopId: { in: shopIds } } }),
      prisma.productAttribute.count({ where: { shopId: { in: shopIds } } }),
    ]);

  // ── Serialize each section ────────────────────────────────────
  const salesSnapshot = serializeSalesSnapshot(allOrders, todayStart, yesterdayStart);
  const revenueTimeline = serializeRevenueTimeline(allOrders, todayStart);
  const weeklyComparison = serializeWeeklyComparison(allOrders, weekStart, prevWeekStart);
  const recentOrders = serializeRecentOrders(allOrders);
  const inventoryAlerts = serializeInventoryAlerts(allVariants);
  const topProducts = serializeTopProducts(allOrders, thirtyDaysAgo);
  const customerStats = serializeCustomerStats(allOrders, weekStart);

  // ── Totals ────────────────────────────────────────────────────
  const totalRevenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);

  return res.json({
    salesSnapshot,
    revenueTimeline,
    weeklyComparison,
    recentOrders,
    inventoryAlerts,
    topProducts,
    customerStats,
    totals: {
      totalRevenue,
      totalProducts,
      totalAttributes,
      totalOrders: allOrders.length,
    },
  });
});

function emptyDashboard() {
  return {
    salesSnapshot: {
      todayRevenue: 0,
      todayOrders: 0,
      todayUnits: 0,
      yesterdayRevenue: 0,
      yesterdayOrders: 0,
      yesterdayUnits: 0,
    },
    revenueTimeline: [],
    weeklyComparison: {
      thisWeekRevenue: 0,
      prevWeekRevenue: 0,
      revenueChangePercent: 0,
    },
    recentOrders: [],
    inventoryAlerts: {
      alertVariants: [],
      outOfStockCount: 0,
      lowStockCount: 0,
      totalStock: 0,
      totalStockValue: 0,
    },
    topProducts: [],
    customerStats: {
      totalCustomers: 0,
      repeatBuyerCount: 0,
      newCustomersThisWeek: 0,
      repeatRate: 0,
    },
    totals: {
      totalRevenue: 0,
      totalProducts: 0,
      totalAttributes: 0,
      totalOrders: 0,
    },
  };
}
