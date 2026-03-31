import type { DbClient } from "./inventoryTypes";

export async function recordMovement(
  tx: DbClient,
  params: {
    productVariantId: string;
    stockDelta: number;
    reservedDelta: number;
    reason: string;
    orderId?: string | null;
    userId?: string | null;
    note?: string | null;
  }
) {
  await tx.inventoryMovement.create({
    data: {
      productVariantId: params.productVariantId,
      stockDelta: params.stockDelta,
      reservedDelta: params.reservedDelta,
      reason: params.reason,
      orderId: params.orderId ?? null,
      userId: params.userId ?? null,
      note: params.note ?? null,
    },
  });
}
