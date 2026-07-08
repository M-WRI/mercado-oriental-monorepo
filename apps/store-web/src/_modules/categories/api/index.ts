import type { TQueryKey } from "@mercado/shared-ui";

export const categoriesEndpoint = {
  queryKey: [["store", "categories"]] as TQueryKey,
  url: "/categories",
};
