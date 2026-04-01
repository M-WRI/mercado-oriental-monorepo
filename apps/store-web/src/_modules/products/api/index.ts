import type { TQueryKey } from "@mercado/shared-ui";

export const productsEndpoint = {
  queryKey: [["store", "products"]] as TQueryKey,
  url: "/products",
};

export const productDetailEndpoint = (id: string) => ({
  queryKey: [["store", "products", id]] as TQueryKey,
  url: `/products/${id}`,
});
