/**
 * Reserved domain for integration test users. Rows are removed in afterAll via
 * cleanupIntegrationTestUsers() so the real DB is not left with test data.
 * (.invalid is reserved per RFC 2606 and should not resolve on the public internet.)
 */
export const INTEGRATION_TEST_EMAIL_DOMAIN = "mercado-test.invalid";

export function makeIntegrationTestEmail(prefix = "user"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@${INTEGRATION_TEST_EMAIL_DOMAIN}`;
}
