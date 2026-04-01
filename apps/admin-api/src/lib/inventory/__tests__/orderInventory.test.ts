import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyInitialOrderInventory, applyOrderStatusInventoryChange } from "../orderInventory";

const mockTransaction = {
  $queryRaw: vi.fn(),
  order: {
    findUnique: vi.fn(),
  },
  productVariant: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  inventoryMovement: {
    create: vi.fn(),
  },
} as any;

describe("Inventory Concurrency Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail to reserve stock when not enough is available via pessimistic lock", async () => {
    mockTransaction.$queryRaw.mockResolvedValue([{ stock: 5, reservedStock: 3 }]);
    mockTransaction.order.findUnique.mockResolvedValue({
      id: "ord-1",
      status: "pending",
      orderItems: [{ productVariantId: "var-1", quantity: 3 }],
    });
    
    await expect(applyInitialOrderInventory(mockTransaction, "ord-1")).rejects.toThrow(/inventory_availability/);
    
    expect(mockTransaction.$queryRaw).toHaveBeenCalled();
  });

  it("should apply initial inventory reservation successfully", async () => {
    mockTransaction.$queryRaw.mockResolvedValue([{ stock: 10, reservedStock: 2 }]);
    mockTransaction.order.findUnique.mockResolvedValue({
      id: "ord-1",
      status: "pending",
      orderItems: [{ productVariantId: "var-1", quantity: 3 }],
    });
    mockTransaction.productVariant.update.mockResolvedValue({});
    mockTransaction.inventoryMovement.create.mockResolvedValue({});
    
    const res = await applyInitialOrderInventory(mockTransaction, "ord-1");
    
    expect(res).toEqual(["var-1"]);
    expect(mockTransaction.$queryRaw).toHaveBeenCalled();
    expect(mockTransaction.productVariant.update).toHaveBeenCalledWith({
      where: { id: "var-1" },
      data: {
        reservedStock: { increment: 3 },
      },
    });
  });

  it("should fail to commit sale if reserved stock is corrupted", async () => {
    mockTransaction.$queryRaw.mockResolvedValue([{ reservedStock: 1 }]);
    
    const mockOrder = {
      id: "ord-1",
      status: "pending",
      orderItems: [{ productVariantId: "var-1", quantity: 3 }],
    };
    
    await expect(applyOrderStatusInventoryChange(mockTransaction, mockOrder, "confirmed")).rejects.toThrow(/inventory_reservation/);
  });
});
