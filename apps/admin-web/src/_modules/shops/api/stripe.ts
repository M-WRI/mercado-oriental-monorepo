import type { TQueryKey } from "@mercado/shared-ui";

export const createStripeConnect = {
  url: (shopId: string) => `/shops/${shopId}/stripe/connect`,
};

export const getStripeConnectStatus = {
  queryKey: (shopId: string) => [["shops", shopId, "stripe", "status"]] as TQueryKey,
  url: (shopId: string) => `/shops/${shopId}/stripe/status`,
};
