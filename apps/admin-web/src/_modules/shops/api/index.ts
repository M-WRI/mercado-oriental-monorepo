import type { TQueryKey } from "@mercado/shared-ui";

export const getShops = {
  queryKey: [["shops"]] as TQueryKey,
  url: "/shops",
};
