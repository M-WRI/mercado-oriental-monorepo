import { INTEGRATION_TEST_EMAIL_DOMAIN } from "./testEmails";

/** Deletes integration test users (email ends with @mercado-test.invalid). Cascades to shops, products, etc. */
export async function cleanupIntegrationTestUsers(): Promise<void> {
  const { prisma } = await import("../../src/lib/prisma");
  await prisma.user.deleteMany({
    where: { email: { endsWith: `@${INTEGRATION_TEST_EMAIL_DOMAIN}` } },
  });
}
