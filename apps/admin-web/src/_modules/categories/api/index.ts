import type { TQueryKey } from "@mercado/shared-ui";

export const getCategories = {
  queryKey: [["categories"]] as TQueryKey,
  url: "/categories",
};

export const createCategory = {
  url: "/categories",
};

export const updateCategory = {
  url: (id: string) => `/categories/${id}`,
};

export const deleteCategory = {
  url: (id: string) => `/categories/${id}`,
};
