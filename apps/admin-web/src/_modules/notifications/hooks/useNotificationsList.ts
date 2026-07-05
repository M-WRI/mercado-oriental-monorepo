import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePatch } from "@/_shared/queryProvider";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api";
import type { INotification } from "../types";

export function useNotificationsList() {
  const queryClient = useQueryClient();
  const { shopId } = useShop();

  const { data: items = [] } = useFetch<INotification[]>({
    queryKey: getNotifications.queryKey(shopId),
    url: getNotifications.url(shopId),
  });

  const { mutate: patchRead } = usePatch();
  const { mutate: patchAll, isPending: isMarkingAll } = usePatch();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getNotifications.queryKey(shopId) });
  };

  const unreadCount = items.filter((n) => !n.readAt).length;

  const markRead = (id: string) => {
    patchRead(
      { url: markNotificationRead.url(id), data: {} },
      { onSuccess: invalidate }
    );
  };

  const markAllRead = () => {
    patchAll(
      { url: markAllNotificationsRead.url, data: {} },
      { onSuccess: invalidate }
    );
  };

  return { items, unreadCount, markRead, markAllRead, isMarkingAll };
}
