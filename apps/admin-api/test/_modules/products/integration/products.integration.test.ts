import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../../helpers/testApp";
import { hasTestDatabase } from "../../../helpers/database";
import { registerRandomUser } from "../../../helpers/registerUser";
import { createShopForUser } from "../../../helpers/createShop";
import { cleanupIntegrationTestUsers } from "../../../helpers/cleanupIntegrationData";
import { createAttributeWithOneValue } from "../../../helpers/createAttributeWithValue";

describe.skipIf(!hasTestDatabase)("products (integration)", () => {
  let app: Awaited<ReturnType<typeof getTestApp>>;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await cleanupIntegrationTestUsers();
  });

  it("creates a product with a variant, lists products, and returns product detail", async () => {
    const { token } = await registerRandomUser(app);
    const shop = await createShopForUser(app, token);
    const valueId = await createAttributeWithOneValue(app, token, shop.id);

    const createRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Product",
        shopId: shop.id,
        productVariants: {
          create: [
            {
              name: "Default",
              price: 9.99,
              stock: 10,
              productVariantAttributeValues: {
                create: [{ productAttributeValueId: valueId }],
              },
            },
          ],
        },
      });

    expect(createRes.status).toBe(201);
    const productId = createRes.body.id as string;

    const listRes = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    const row = listRes.body.data.find((p: { id: string }) => p.id === productId);
    expect(row).toBeDefined();
    expect(row.name).toBe("Test Product");

    const showRes = await request(app)
      .get(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(showRes.status).toBe(200);
    expect(showRes.body.id).toBe(productId);
    expect(showRes.body.name).toBe("Test Product");
    expect(showRes.body.shop.id).toBe(shop.id);
    expect(showRes.body.analytics).toBeDefined();
    expect(Array.isArray(showRes.body.variants)).toBe(true);
    expect(showRes.body.variants.length).toBeGreaterThan(0);
  });

  it("does not expose another vendor's products", async () => {
    const { token: tokenA } = await registerRandomUser(app);
    const shopA = await createShopForUser(app, tokenA);
    const valueIdA = await createAttributeWithOneValue(app, tokenA, shopA.id);

    const createRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Vendor A Product",
        shopId: shopA.id,
        productVariants: {
          create: [
            {
              name: "Only",
              price: 1,
              stock: 1,
              productVariantAttributeValues: {
                create: [{ productAttributeValueId: valueIdA }],
              },
            },
          ],
        },
      });
    expect(createRes.status).toBe(201);
    const productId = createRes.body.id as string;

    const { token: tokenB } = await registerRandomUser(app);

    const listRes = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((p: { id: string }) => p.id === productId)).toBe(false);

    const showRes = await request(app)
      .get(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(showRes.status).toBe(404);
  });
});
