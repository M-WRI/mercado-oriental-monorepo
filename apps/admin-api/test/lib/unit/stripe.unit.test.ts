import { eurosToCents, computeTransferCents } from "../../src/lib/stripe";
import { describe, expect, it } from "vitest";

describe("stripe amounts", () => {
  it("converts euros to cents", () => {
    expect(eurosToCents(10.5)).toBe(1050);
    expect(eurosToCents(19.99)).toBe(1999);
  });

  it("computes transfer after platform fee", () => {
    expect(computeTransferCents(100, 5)).toBe(9500);
    expect(computeTransferCents(10, 0)).toBe(1000);
  });
});
