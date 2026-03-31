import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { registerRandomUser } from "../../../helpers/registerUser";
import { createShopForUser } from "../../../helpers/createShop";
import { seedProductWithVariant, seedOrderViaDb } from "../../../helpers/createOrder";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";

describe.skipIf(!hasTestDatabase)("orders (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("lists orders for the authenticated vendor's shops", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);

    await seedOrderViaDb(shop.id, variantId);
    await seedOrderViaDb(shop.id, variantId, { status: "shipped" });

    const listRes = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(2);
    expect(listRes.body[0]).toHaveProperty("customerEmail");
    expect(listRes.body[0]).toHaveProperty("itemCount");
  });

  it("filters orders by status", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);

    await seedOrderViaDb(shop.id, variantId, { status: "pending" });
    await seedOrderViaDb(shop.id, variantId, { status: "shipped" });

    const res = await request(app)
      .get("/api/orders?status=pending")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.every((o: any) => o.status === "pending")).toBe(true);
  });

  it("shows order detail with items", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);

    const order = await seedOrderViaDb(shop.id, variantId);

    const showRes = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(showRes.status).toBe(200);
    expect(showRes.body.id).toBe(order.id);
    expect(showRes.body.shop.id).toBe(shop.id);
    expect(Array.isArray(showRes.body.items)).toBe(true);
    expect(showRes.body.items.length).toBe(1);
    expect(showRes.body.items[0]).toHaveProperty("lineTotal");
  });

  it("does not expose another vendor's orders", async () => {
    const { token: tokenA } = await registerRandomUser(app);
    const shopA = await createShopForUser(app, tokenA);
    const { variantId } = await seedProductWithVariant(shopA.id);

    const order = await seedOrderViaDb(shopA.id, variantId);

    const { token: tokenB } = await registerRandomUser(app);

    const listRes = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(listRes.body.some((o: any) => o.id === order.id)).toBe(false);

    const showRes = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(showRes.status).toBe(404);
  });

  it("advances order status through the fulfillment flow", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);

    const order = await seedOrderViaDb(shop.id, variantId, { status: "pending" });

    // pending → confirmed
    let res = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
    expect(res.body.confirmedAt).toBeTruthy();

    // confirmed → packed
    res = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "packed" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("packed");

    // packed → shipped (requires tracking)
    res = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "shipped" });
    expect(res.status).toBe(400);

    res = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "shipped", trackingNumber: "DHL123456", carrier: "DHL" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("shipped");
    expect(res.body.trackingNumber).toBe("DHL123456");

    // shipped → delivered
    res = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "delivered" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("delivered");
    expect(res.body.deliveredAt).toBeTruthy();
  });

  it("rejects invalid status transitions", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);

    const order = await seedOrderViaDb(shop.id, variantId, { status: "pending" });

    // pending → shipped (skip confirmed+packed)
    const res = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "shipped", trackingNumber: "X" });
    expect(res.status).toBe(400);
  });

  it("cancels an order with reason", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);

    const order = await seedOrderViaDb(shop.id, variantId, { status: "confirmed" });

    const res = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "cancelled", cancelReason: "Out of stock" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
    expect(res.body.cancelReason).toBe("Out of stock");
    expect(res.body.cancelledAt).toBeTruthy();
  });

  it("updates internal note and tracking on an order", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);

    const order = await seedOrderViaDb(shop.id, variantId);

    const res = await request(app)
      .put(`/api/orders/${order.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ internalNote: "VIP customer", trackingNumber: "UPS999" });

    expect(res.status).toBe(200);
    expect(res.body.internalNote).toBe("VIP customer");
    expect(res.body.trackingNumber).toBe("UPS999");
  });
});
