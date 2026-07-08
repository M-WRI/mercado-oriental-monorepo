import type { TQueryKey } from "@mercado/shared-ui";

export const reviewsEndpoint = {
  queryKey: [["store", "reviews"]] as TQueryKey,
  url: "/reviews",
};
