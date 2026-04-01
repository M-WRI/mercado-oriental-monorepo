import { AppError, ERROR_CODES } from "../error";
import type { DbClient } from "./inventoryTypes";
import { INV_REASON } from "./constants";
import { recordMovement } from "./movement";

const COMMITTED = new Set(["confirmed", "packed", "shipped", "delivered"]);

function available(stock: number, reserved: number) {
  return stock - reserved;
}

async function assertLineFitsReservation(tx: DbClient, variantId: string, qty: number) {
  // Pessimistic lock the row to avoid concurrent check-and-reserve race conditions
  const rows = await tx.$queryRaw<{ stock: number; reservedStock: number }[]>`
    SELECT stock, "reservedStock" 
    FROM "ProductVariant" 
    WHERE id = ${variantId} 
    FOR UPDATE
  `;
  
  if (!rows || rows.length === 0) {
    throw new AppError({
      case: "variant",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }
  
  const v = rows[0];
  if (available(v.stock, v.reservedStock) < qty) {
    throw new AppError({
      case: "inventory_availability",
      code: ERROR_CODES.INVALID,
      statusCode: 409,
    });
  }
}

async function assertReservedAtLeast(tx: DbClient, variantId: string, qty: number) {
  const rows = await tx.$queryRaw<{ reservedStock: number }[]>`
    SELECT "reservedStock" 
    FROM "ProductVariant" 
    WHERE id = ${variantId} 
    FOR UPDATE
  `;
  if (!rows || rows.length === 0 || rows[0].reservedStock < qty) {
    throw new AppError({
      case: "inventory_reservation",
      code: ERROR_CODES.INVALID,
      statusCode: 409,
    });
  }
}

async function assertOnHandAtLeast(tx: DbClient, variantId: string, qty: number) {
  const rows = await tx.$queryRaw<{ stock: number }[]>`
    SELECT stock 
    FROM "ProductVariant" 
    WHERE id = ${variantId} 
    FOR UPDATE
  `;
  if (!rows || rows.length === 0 || rows[0].stock < qty) {
    throw new AppError({
      case: "inventory_availability",
      code: ERROR_CODES.INVALID,
      statusCode: 409,
    });
  }
}

export async function applyInitialOrderInventory(
  tx: DbClient,
  orderId: string
): Promise<string[]> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) return [];

  const touched: string[] = [];

  for (const line of order.orderItems) {
    if (!line.productVariantId) continue;
    touched.push(line.productVariantId);

    if (order.status === "pending") {
      await assertLineFitsReservation(tx, line.productVariantId, line.quantity);
      await tx.productVariant.update({
        where: { id: line.productVariantId },
        data: { reservedStock: { increment: line.quantity } },
      });
      await recordMovement(tx, {
        productVariantId: line.productVariantId,
        stockDelta: 0,
        reservedDelta: line.quantity,
        reason: INV_REASON.RESERVATION_HOLD,
        orderId,
      });
    } else if (COMMITTED.has(order.status)) {
      await assertOnHandAtLeast(tx, line.productVariantId, line.quantity);
      await tx.productVariant.update({
        where: { id: line.productVariantId },
        data: { stock: { decrement: line.quantity } },
      });
      await recordMovement(tx, {
        productVariantId: line.productVariantId,
        stockDelta: -line.quantity,
        reservedDelta: 0,
        reason: INV_REASON.SALE_COMMIT,
        orderId,
      });
    }
  }

  return [...new Set(touched)];
}

/** Apply inventory side-effects when order status changes. Returns affected variant IDs. */
export async function applyOrderStatusInventoryChange(
  tx: DbClient,
  order: { id: string; status: string; orderItems: { productVariantId: string | null; quantity: number }[] },
  nextStatus: string
): Promise<string[]> {
  const prev = order.status;
  const touched: string[] = [];

  const lines = order.orderItems.filter((l) => l.productVariantId);

  if (prev === "pending" && nextStatus === "confirmed") {
    for (const line of lines) {
      const vid = line.productVariantId!;
      touched.push(vid);
      await assertReservedAtLeast(tx, vid, line.quantity);
      await assertOnHandAtLeast(tx, vid, line.quantity);
      await tx.productVariant.update({
        where: { id: vid },
        data: {
          reservedStock: { decrement: line.quantity },
          stock: { decrement: line.quantity },
        },
      });
      await recordMovement(tx, {
        productVariantId: vid,
        stockDelta: -line.quantity,
        reservedDelta: -line.quantity,
        reason: INV_REASON.SALE_COMMIT,
        orderId: order.id,
      });
    }
    return [...new Set(touched)];
  }

  if (prev === "pending" && nextStatus === "cancelled") {
    for (const line of lines) {
      const vid = line.productVariantId!;
      touched.push(vid);
      await assertReservedAtLeast(tx, vid, line.quantity);
      await tx.productVariant.update({
        where: { id: vid },
        data: { reservedStock: { decrement: line.quantity } },
      });
      await recordMovement(tx, {
        productVariantId: vid,
        stockDelta: 0,
        reservedDelta: -line.quantity,
        reason: INV_REASON.RESERVATION_RELEASE,
        orderId: order.id,
      });
    }
    return [...new Set(touched)];
  }

  if ((prev === "confirmed" || prev === "packed") && nextStatus === "cancelled") {
    for (const line of lines) {
      const vid = line.productVariantId!;
      touched.push(vid);
      await tx.productVariant.update({
        where: { id: vid },
        data: { stock: { increment: line.quantity } },
      });
      await recordMovement(tx, {
        productVariantId: vid,
        stockDelta: line.quantity,
        reservedDelta: 0,
        reason: INV_REASON.ORDER_CANCEL_RESTOCK,
        orderId: order.id,
      });
    }
    return [...new Set(touched)];
  }

  return [];
}
