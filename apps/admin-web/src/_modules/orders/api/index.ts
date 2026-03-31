import type { TQueryKey } from "@mercado/shared-ui";

export const getOrders = {
  queryKey: [["orders"]] as TQueryKey,
  url: "/orders",
};

export const getOrder = {
  queryKey: (id?: string) => [["orders", id]] as TQueryKey,
  url: (id?: string) => `/orders/${id}`,
};

export const updateOrder = {
  url: (id: string) => `/orders/${id}`,
};

export const updateOrderStatus = {
  url: (id: string) => `/orders/${id}/status`,
};

export const restockOrder = {
  url: (id: string) => `/orders/${id}/restock`,
};
