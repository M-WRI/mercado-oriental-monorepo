import type { Express } from "express";

let cached: Express | null = null;

/** Single Express app per test worker (no listen). Safe for sequential file runs. */
export async function getTestApp(): Promise<Express> {
  if (!cached) {
    const { createApp } = await import("../../src/app");
    cached = createApp();
  }
  return cached;
}
