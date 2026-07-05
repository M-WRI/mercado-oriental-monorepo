import { prisma } from "../../../lib";

type NotificationRow = {
  id: string;
  payload: unknown;
};

export async function filterNotificationsByShop<T extends NotificationRow>(
  rows: T[],
  shopId: string
): Promise<T[]> {
  const filtered: T[] = [];

  for (const row of rows) {
    const payload = row.payload as Record<string, unknown> | null;
    if (!payload) continue;

    if (payload.shopId === shopId) {
      filtered.push(row);
      continue;
    }

    if (typeof payload.orderId === "string") {
      const order = await prisma.order.findUnique({
        where: { id: payload.orderId },
        select: { shopId: true },
      });
      if (order?.shopId === shopId) {
        filtered.push(row);
        continue;
      }
    }

    if (typeof payload.productId === "string") {
      const product = await prisma.product.findUnique({
        where: { id: payload.productId },
        select: { shopId: true },
      });
      if (product?.shopId === shopId) {
        filtered.push(row);
        continue;
      }
    }

    if (typeof payload.variantId === "string") {
      const variant = await prisma.productVariant.findUnique({
        where: { id: payload.variantId },
        include: { product: { select: { shopId: true } } },
      });
      if (variant?.product.shopId === shopId) {
        filtered.push(row);
      }
    }
  }

  return filtered;
}
