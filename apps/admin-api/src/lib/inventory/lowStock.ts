import { prisma } from "../prisma";
import { NOTIFICATION_TYPE } from "../notifications/constants";
import { dispatchVendorEmailForNotification } from "../email";

function available(stock: number, reserved: number) {
  return stock - reserved;
}

export function dedupeKeyLowStock(variantId: string) {
  return `low_stock:${variantId}`;
}

/** After stock/reserved changes, sync LOW_STOCK notification for vendor (shop owner). */
export async function syncLowStockNotificationsForVariants(variantIds: string[]) {
  const unique = [...new Set(variantIds)];
  for (const variantId of unique) {
    const v = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            shop: { select: { userId: true, defaultLowStockThreshold: true } },
          },
        },
      },
    });
    if (!v) continue;

    const threshold =
      v.lowStockThreshold ?? v.product.shop.defaultLowStockThreshold;
    const avail = available(v.stock, v.reservedStock);
    const userId = v.product.shop.userId;
    const key = dedupeKeyLowStock(variantId);

    if (avail <= threshold) {
      const title = "Low stock";
      const body = `${v.product.name} — ${v.name}: ${avail} available (threshold ${threshold})`;
      await prisma.notification.upsert({
        where: { dedupeKey: key },
        create: {
          userId,
          type: NOTIFICATION_TYPE.LOW_STOCK,
          title,
          body,
          dedupeKey: key,
          payload: {
            variantId,
            productId: v.productId,
            shopId: v.product.shopId,
            productName: v.product.name,
            variantName: v.name,
            available: avail,
            threshold,
          },
        },
        update: {
          title,
          body,
          readAt: null,
          payload: {
            variantId,
            productId: v.productId,
            shopId: v.product.shopId,
            productName: v.product.name,
            variantName: v.name,
            available: avail,
            threshold,
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (user?.email) {
        dispatchVendorEmailForNotification(NOTIFICATION_TYPE.LOW_STOCK, user.email, {
          productName: v.product.name,
          variantName: v.name,
          available: avail,
          threshold,
          shopId: v.product.shopId,
        }).catch((err) => console.error("[email] low stock notification failed:", err));
      }
    } else {
      await prisma.notification.deleteMany({ where: { dedupeKey: key } });
    }
  }
}
