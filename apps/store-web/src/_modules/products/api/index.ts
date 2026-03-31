import type { TQueryKey } from "@mercado/shared-ui";

export const productsEndpoint = {
  queryKey: [["store", "products"]] as TQueryKey,
  url: "/store/products",
};

export const productDetailEndpoint = (id: string) => ({
  queryKey: [["store", "products", id]] as TQueryKey,
  url: `/store/products/${id}`,
});
