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

export const getShopDisputes = {
  queryKey: (shopId: string, status?: string) =>
    [["disputes", "shop", shopId, status ?? "all"]] as TQueryKey,
  url: (shopId: string, status?: string) => {
    const params = new URLSearchParams({ shopId });
    if (status) params.set("status", status);
    return `/touchpoints/disputes?${params.toString()}`;
  },
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
