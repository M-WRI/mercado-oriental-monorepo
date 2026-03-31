/** True after `test/setup.ts` loads env when `DATABASE_URL` is set (integration tests need DB + Prisma). */
export const hasTestDatabase = Boolean(process.env.DATABASE_URL);
