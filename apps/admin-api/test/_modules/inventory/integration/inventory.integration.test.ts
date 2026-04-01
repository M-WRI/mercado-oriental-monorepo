import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { registerRandomUser } from "../../../helpers/registerUser";
import { createShopForUser } from "../../../helpers/createShop";
import { seedProductWithVariant, seedOrderViaDb } from "../../../helpers/createOrder";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";
import { INV_REASON } from "../../../../src/lib/inventory/constants";

interface ProductVariant {
  id: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  [k: string]: unknown;
}

interface ProductItem {
  id: string;
  variants: ProductVariant[];
  [k: string]: unknown;
}

function findVariant(products: ProductItem[], variantId: string): ProductVariant {
  for (const p of products) {
    const v = p.variants.find((v) => v.id === variantId);
    if (v) return v;
  }
  throw new Error(`variant ${variantId} not found in products response`);
}

describe.skipIf(!hasTestDatabase)("inventory (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("reserves stock for pending orders and commits on confirm", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id, { stock: 20 });

    await seedOrderViaDb(shop.id, variantId, { status: "pending", quantity: 3 });

    const pRes1 = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${token}`);
    expect(pRes1.status).toBe(200);
    const row1 = findVariant(pRes1.body.data, variantId);
    expect(row1.reservedStock).toBe(3);
    expect(row1.stock).toBe(20);
    expect(row1.availableStock).toBe(17);

    const order = await seedOrderViaDb(shop.id, variantId, { status: "pending", quantity: 1 });
    const listOrders = await request(app).get("/api/admin/orders").set("Authorization", `Bearer ${token}`);
    const o = listOrders.body.data.find((x: { id: string }) => x.id === order.id);
    expect(o).toBeDefined();

    await request(app)
      .put(`/api/admin/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    const pRes2 = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${token}`);
    const row2 = findVariant(pRes2.body.data, variantId);
    expect(row2.reservedStock).toBe(3);
    expect(row2.stock).toBe(19);
    expect(row2.availableStock).toBe(16);
  });

  it("bulk-adjusts stock and creates low-stock notification when crossing threshold", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id, { stock: 10 });

    const bulkRes = await request(app)
      .post("/api/admin/inventory/bulk-adjust")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ variantId, stockDelta: -8, note: "test bulk" }],
      });
    expect(bulkRes.status).toBe(200);

    const pRes = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${token}`);
    const row = findVariant(pRes.body.data, variantId);
    expect(row.stock).toBe(2);

    const nRes = await request(app).get("/api/admin/notifications").set("Authorization", `Bearer ${token}`);
    expect(nRes.status).toBe(200);
    const low = nRes.body.filter((n: { type: string }) => n.type === "LOW_STOCK");
    expect(low.length).toBeGreaterThanOrEqual(1);
    expect(low.some((n: { readAt: unknown }) => n.readAt == null)).toBe(true);

    const mark = await request(app)
      .patch(`/api/admin/notifications/${low[0].id}/read`)
      .set("Authorization", `Bearer ${token}`);
    expect(mark.status).toBe(200);
    expect(mark.body.readAt).toBeTruthy();
  });

  it("adjusts stock with DAMAGE reason", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id, { stock: 30 });

    const res = await request(app)
      .post("/api/admin/inventory/adjust")
      .set("Authorization", `Bearer ${token}`)
      .send({ variantId, stockDelta: -4, reason: INV_REASON.DAMAGE });
    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(26);
  });

  it("lists movements for a variant", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id, { stock: 40 });

    await request(app)
      .post("/api/admin/inventory/adjust")
      .set("Authorization", `Bearer ${token}`)
      .send({ variantId, stockDelta: -2, reason: INV_REASON.ADJUSTMENT, note: "count" });

    const res = await request(app)
      .get(`/api/admin/inventory/movements?variantId=${variantId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("reason");
  });

  it("restocks a delivered order", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id, { stock: 50 });

    const delivered = await seedOrderViaDb(shop.id, variantId, { status: "delivered", quantity: 2 });
    const lineId = delivered.orderItems[0].id;

    const pBefore = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${token}`);
    const before = findVariant(pBefore.body.data, variantId);
    expect(before.stock).toBe(48);

    const res = await request(app)
      .post(`/api/admin/orders/${delivered.id}/restock`)
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ orderItemId: lineId, quantity: 1 }] });
    expect(res.status).toBe(200);

    const pAfter = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${token}`);
    const after = findVariant(pAfter.body.data, variantId);
    expect(after.stock).toBe(49);
  });
});
