import type { TQueryKey } from "@mercado/shared-ui";

export const getNotifications = {
  queryKey: [["notifications"]] as TQueryKey,
  url: "/notifications",
};

export const markNotificationRead = {
  url: (id: string) => `/notifications/${id}/read`,
};

export const markAllNotificationsRead = {
  url: "/notifications/read-all",
};
