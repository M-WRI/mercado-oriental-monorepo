import type { TQueryKey } from "@mercado/shared-ui";

export const getProducts = {
  queryKey: [["products"]] as TQueryKey,
  url: "/products",
};

export const createProduct = {
  url: "/products",
};

export const getAttributesByShop = {
  queryKey: (shopId: string) => [["attributes", shopId]] as TQueryKey,
  url: (shopId: string) => `/attributes?shopId=${shopId}`,
};

export const getProduct = {
  queryKey: (id?: string) => [["products", id]] as TQueryKey,
  url: (id?: string) => `/products/${id}`,
};

export const updateProduct = {
  url: (id: string) => `/products/${id}`,
};

export const getProductVariants = {
  queryKey: (id?: string) => [["products", id, "variants"]] as TQueryKey,
  url: (id?: string) => `/products/${id}/variants`,
};

export const createAttribute = {
  url: "/attributes",
};
