import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { registerRandomUser } from "../../../helpers/registerUser";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";

describe.skipIf(!hasTestDatabase)("dashboard (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("returns empty dashboard payload when user has no shops", async () => {
    const { token } = await registerRandomUser(app);

    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.salesSnapshot).toMatchObject({
      todayRevenue: 0,
      todayOrders: 0,
      todayUnits: 0,
    });
    expect(res.body.revenueTimeline).toEqual([]);
    expect(res.body.recentOrders).toEqual([]);
    expect(res.body.topProducts).toEqual([]);
    expect(res.body.totals).toMatchObject({
      totalRevenue: 0,
      totalProducts: 0,
      totalAttributes: 0,
      totalOrders: 0,
    });
    expect(res.body.customerStats).toMatchObject({
      totalCustomers: 0,
      repeatBuyerCount: 0,
    });
  });
});
