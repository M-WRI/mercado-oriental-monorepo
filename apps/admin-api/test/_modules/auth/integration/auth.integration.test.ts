import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";
import { makeIntegrationTestEmail } from "../../../helpers/testEmails";

describe.skipIf(!hasTestDatabase)("auth (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("returns 400 for login with missing credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      case: "login_credentials",
      code: "MISSING",
    });
  });

  it("registers, then GET /me returns the user with Bearer token", async () => {
    const email = makeIntegrationTestEmail("auth");
    const password = "secret12";

    const reg = await request(app).post("/api/auth/register").send({
      email,
      password,
      name: "Test User",
    });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();
    expect(reg.body.user.email).toBe(email);

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${reg.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);
  });
});
