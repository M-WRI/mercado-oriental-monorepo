import type { TQueryKey } from "@mercado/shared-ui";

export const createCheckoutEndpoint = {
  url: "/checkout",
};

export const checkoutStatusEndpoint = (sessionId: string) => ({
  queryKey: [["store", "checkout", sessionId]] as TQueryKey,
  url: `/checkout/status?session_id=${encodeURIComponent(sessionId)}`,
});
