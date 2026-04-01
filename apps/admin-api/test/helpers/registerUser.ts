import request from "supertest";
import type { Express } from "express";
import { expect } from "vitest";
import { makeIntegrationTestEmail } from "./testEmails";

export async function registerRandomUser(
  app: Express,
  options?: { name?: string; password?: string }
) {
  const email = makeIntegrationTestEmail("user");
  const password = options?.password ?? "secret12";
  const res = await request(app).post("/api/admin/auth/register").send({
    email,
    password,
    ...(options?.name !== undefined ? { name: options.name } : {}),
  });
  expect(res.status).toBe(201);
  expect(res.body.token).toBeTruthy();
  return { email, token: res.body.token as string, user: res.body.user };
}
