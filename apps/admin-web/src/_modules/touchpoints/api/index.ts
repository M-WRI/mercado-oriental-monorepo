import type { TQueryKey } from "@mercado/shared-ui";

export const getOrderMessages = {
  queryKey: (orderId?: string) => [["orderMessages", orderId]] as TQueryKey,
  url: (orderId?: string) => `/touchpoints/orders/${orderId}/messages`,
};

export const createOrderMessage = {
  url: (orderId: string) => `/touchpoints/orders/${orderId}/messages`,
};

export const getOrderDisputes = {
  queryKey: (orderId?: string) => [["disputes", orderId]] as TQueryKey,
  url: (orderId?: string) => `/touchpoints/disputes?orderId=${orderId}`,
};

export const getDispute = {
  queryKey: (id?: string) => [["dispute", id]] as TQueryKey,
  url: (id?: string) => `/touchpoints/disputes/${id}`,
};

export const createDispute = {
  url: (orderId: string) => `/touchpoints/orders/${orderId}/disputes`,
};

export const updateDisputeStatus = {
  url: (id: string) => `/touchpoints/disputes/${id}/status`,
};

export const createDisputeMessage = {
  url: (id: string) => `/touchpoints/disputes/${id}/messages`,
};
