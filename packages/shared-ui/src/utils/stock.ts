/** Sellable units (on hand minus reservations). */
export function availableUnits(stock: number, reservedStock: number): number {
  return Math.max(0, stock - Math.max(0, reservedStock));
}

export type StockHealthLevel = "out" | "low" | "ok";

/** Classify available quantity against the effective low-stock threshold for a SKU. */
export function stockHealthLevel(
  available: number,
  lowStockThreshold: number
): StockHealthLevel {
  if (available <= 0) return "out";
  if (available <= lowStockThreshold) return "low";
  return "ok";
}
