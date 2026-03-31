import { describe, it, expect } from "vitest";
import { serializeVariantStats } from "./variantStats";
import type { RawVariant } from "./variantStats";

function mockVariant(partial: Partial<RawVariant> & Pick<RawVariant, "id" | "name" | "price">): RawVariant {
  return {
    orderItems: [],
    productVariantAttributeValues: [],
    stock: 10,
    reservedStock: 2,
    lowStockThreshold: null,
    ...partial,
  };
}

describe("serializeVariantStats", () => {
  it("uses available stock for low-stock counts and thresholds", () => {
    const now = new Date();
    const variants = [
      mockVariant({
        id: "a",
        name: "V1",
        price: 5,
        stock: 10,
        reservedStock: 8,
        lowStockThreshold: null,
      }),
    ];
    const { stats, accumulator } = serializeVariantStats(variants, now, 5);
    expect(stats[0].availableStock).toBe(2);
    expect(stats[0].lowStockThreshold).toBe(5);
    expect(accumulator.lowStockCount).toBe(1);
    expect(accumulator.outOfStockCount).toBe(0);
  });

  it("counts out of stock when available is zero", () => {
    const now = new Date();
    const variants = [
      mockVariant({
        id: "b",
        name: "V2",
        price: 1,
        stock: 3,
        reservedStock: 3,
      }),
    ];
    const { accumulator } = serializeVariantStats(variants, now, 5);
    expect(accumulator.outOfStockCount).toBe(1);
  });
});
