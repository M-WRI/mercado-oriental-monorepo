import type { TQueryKey } from "@mercado/shared-ui";

export const getShops = {
  queryKey: [["shops"]] as TQueryKey,
  url: "/shops",
};

export const getShop = {
  queryKey: (id?: string) => [["shops", id]] as TQueryKey,
  url: (id?: string) => `/shops/${id}`,
};

export const createShop = {
  url: "/shops",
};

export const updateShop = {
  url: (id: string) => `/shops/${id}`,
};

export const deleteShop = {
  url: (id: string) => `/shops/${id}`,
};
