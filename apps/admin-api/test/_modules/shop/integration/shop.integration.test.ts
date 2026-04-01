import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { registerRandomUser } from "../../../helpers/registerUser";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";

describe.skipIf(!hasTestDatabase)("shop (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("returns 401 for GET /shops without Authorization", async () => {
    const res = await request(app).get("/api/admin/shops");
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      case: "auth_token",
      code: "MISSING",
    });
  });

  it("returns 401 for GET /shops with invalid Bearer token", async () => {
    const res = await request(app)
      .get("/api/admin/shops")
      .set("Authorization", "Bearer not-a-real-jwt");
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      case: "auth_token",
      code: "INVALID",
    });
  });

  it("lists shops as empty array for a new user", async () => {
    const { token } = await registerRandomUser(app);

    const list = await request(app)
      .get("/api/admin/shops")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body).toHaveLength(0);
  });
});
