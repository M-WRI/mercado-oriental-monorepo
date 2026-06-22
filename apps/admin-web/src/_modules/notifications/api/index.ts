import type { TQueryKey } from "@mercado/shared-ui";

export const getNotifications = {
  queryKey: (shopId: string) => [["notifications", shopId]] as TQueryKey,
  url: (shopId: string) => `/notifications?shopId=${shopId}`,
};

export const markNotificationRead = {
  url: (id: string) => `/notifications/${id}/read`,
};

export const markAllNotificationsRead = {
  url: "/notifications/read-all",
};
