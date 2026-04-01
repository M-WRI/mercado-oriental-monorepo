import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { registerRandomUser } from "../../../helpers/registerUser";
import { createShopForUser } from "../../../helpers/createShop";
import { seedProductWithVariant, seedOrderViaDb } from "../../../helpers/createOrder";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";
import { notifyNewOrder, notifyPaymentFailed } from "../../../../src/lib/notifications";
import { NOTIFICATION_TYPE } from "../../../../src/lib/notifications";

describe.skipIf(!hasTestDatabase)("notifications (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("returns NEW_ORDER and PAYMENT_FAILED in-app notifications", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const { variantId } = await seedProductWithVariant(shop.id);
    const order = await seedOrderViaDb(shop.id, variantId, {
      customerName: "Integration Customer",
      totalAmount: 42.5,
    });

    await notifyNewOrder(order.id);
    await notifyPaymentFailed({
      shopId: shop.id,
      orderId: order.id,
      amount: 10,
      reason: "Test decline",
      providerReference: `test-ref-${order.id}`,
    });

    const res = await request(app)
      .get("/api/admin/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const types = (res.body as { type: string }[]).map((n) => n.type);
    expect(types).toContain(NOTIFICATION_TYPE.NEW_ORDER);
    expect(types).toContain(NOTIFICATION_TYPE.PAYMENT_FAILED);

    const newOrder = res.body.find((n: { type: string }) => n.type === NOTIFICATION_TYPE.NEW_ORDER);
    expect(newOrder.body).toContain("Integration Customer");
    expect(newOrder.payload).toMatchObject({ orderId: order.id });
  });
});
