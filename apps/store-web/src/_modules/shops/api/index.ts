import type { TQueryKey } from "@mercado/shared-ui";

export const shopsEndpoint = {
  queryKey: [["store", "shops"]] as TQueryKey,
  url: "/shops",
};

export const shopDetailEndpoint = (id: string) => ({
  queryKey: [["store", "shops", id]] as TQueryKey,
  url: `/shops/${id}`,
});
