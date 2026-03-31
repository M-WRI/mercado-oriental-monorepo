import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { registerRandomUser } from "../../../helpers/registerUser";
import { createShopForUser } from "../../../helpers/createShop";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";

describe.skipIf(!hasTestDatabase)("attributes (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("creates an attribute with values, then lists and gets by id filtered by shop", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);

    const createRes = await request(app)
      .post("/api/attributes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Size",
        shopId: shop.id,
        productAttributeValues: [{ value: "S" }, { value: "M" }],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe("Size");
    expect(createRes.body.productAttributeValues).toHaveLength(2);
    const attributeId = createRes.body.id as string;

    const listRes = await request(app)
      .get("/api/attributes")
      .query({ shopId: shop.id })
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.some((a: { id: string }) => a.id === attributeId)).toBe(true);

    const getRes = await request(app)
      .get(`/api/attributes/${attributeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(attributeId);
    expect(getRes.body.productAttributeValues).toHaveLength(2);
  });
});
