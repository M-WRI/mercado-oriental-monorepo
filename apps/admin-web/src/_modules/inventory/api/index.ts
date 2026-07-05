import type { TQueryKey } from "@mercado/shared-ui";

export const bulkAdjustInventory = {
  url: "/inventory/bulk-adjust",
};

export const getInventoryMovements = {
  queryKey: (variantId: string) => [["inventory", "movements", variantId]] as TQueryKey,
  url: (variantId: string) => `/inventory/movements?variantId=${variantId}`,
};

export interface IInventoryMovement {
  id: string;
  productVariantId: string;
  stockDelta: number;
  reservedDelta: number;
  reason: string;
  orderId: string | null;
  userId: string | null;
  note: string | null;
  createdAt: string;
}
