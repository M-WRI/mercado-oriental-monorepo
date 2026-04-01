import request from "supertest";
import type { Express } from "express";
import { expect } from "vitest";

export async function createAttributeWithOneValue(app: Express, token: string, shopId: string) {
  const res = await request(app)
    .post("/api/admin/attributes")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: `TestAttr-${Date.now()}`,
      shopId,
      productAttributeValues: [{ value: "V1" }],
    });
  expect(res.status).toBe(201);
  const valueId = res.body.productAttributeValues[0].id as string;
  return valueId;
}
