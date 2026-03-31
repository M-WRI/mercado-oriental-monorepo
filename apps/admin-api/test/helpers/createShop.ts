import request from "supertest";
import type { Express } from "express";
import { expect } from "vitest";

export async function createShopForUser(
  app: Express,
  token: string,
  options?: { name?: string; description?: string }
) {
  const res = await request(app)
    .post("/api/shops")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: options?.name ?? `Test Shop ${Date.now()}`,
      ...(options?.description !== undefined ? { description: options.description } : {}),
    });
  expect(res.status).toBe(201);
  return res.body as { id: string; name: string; description: string | null };
}
