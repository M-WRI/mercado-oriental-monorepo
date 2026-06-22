import type { TQueryKey } from "@mercado/shared-ui";

export const getDashboard = {
  queryKey: (shopId: string) => [["dashboard", shopId]] as TQueryKey,
  url: (shopId: string) => `/dashboard?shopId=${shopId}`,
};
