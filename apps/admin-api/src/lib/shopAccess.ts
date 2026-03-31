import { prisma } from "./prisma";
import { AppError, ERROR_CODES } from "./error";

export async function getShopIdsForUser(userId: string): Promise<string[]> {
  const shops = await prisma.shop.findMany({
    where: { userId },
    select: { id: true },
  });
  return shops.map((s) => s.id);
}

/** Ensures the shop belongs to the current user (vendor). */
export function assertShopBelongsToUser(shopId: string, shopIds: string[]): void {
  if (!shopIds.includes(shopId)) {
    throw new AppError({
      case: "shop_access",
      code: ERROR_CODES.FORBIDDEN,
      statusCode: 403,
    });
  }
}
