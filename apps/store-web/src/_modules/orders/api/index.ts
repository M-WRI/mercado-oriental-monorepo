import type { TQueryKey } from "@mercado/shared-ui";

export const ordersEndpoint = {
  queryKey: [["store", "orders"]] as TQueryKey,
  url: "/store/orders",
};

export const orderDetailEndpoint = (id: string) => ({
  queryKey: [["store", "orders", id]] as TQueryKey,
  url: `/store/orders/${id}`,
});

export const createOrderEndpoint = {
  url: "/store/orders",
};
