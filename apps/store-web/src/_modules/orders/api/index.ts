import type { TQueryKey } from "@mercado/shared-ui";

export const ordersEndpoint = {
  queryKey: [["store", "orders"]] as TQueryKey,
  url: "/orders",
};

export const orderDetailEndpoint = (id: string) => ({
  queryKey: [["store", "orders", id]] as TQueryKey,
  url: `/orders/${id}`,
});

export const createOrderEndpoint = {
  url: "/orders",
};

export const orderMessagesEndpoint = (orderId: string) => ({
  queryKey: [["store", "orders", orderId, "messages"]] as TQueryKey,
  url: `/orders/${orderId}/messages`,
});

export const createMessageEndpoint = (orderId: string) => ({
  url: `/orders/${orderId}/messages`,
});
