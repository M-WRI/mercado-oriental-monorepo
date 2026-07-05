import {
  NotificationCard,
  NotificationsEmptyState,
  NotificationsListHeader,
} from "../components";
import { useNotificationsList } from "../hooks";

export const NotificationsList = () => {
  const { items, unreadCount, markRead, markAllRead, isMarkingAll } = useNotificationsList();

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      <NotificationsListHeader
        unreadCount={unreadCount}
        isMarkingAll={isMarkingAll}
        onMarkAllRead={markAllRead}
      />

      <div className="space-y-3">
        {items.length === 0 && <NotificationsEmptyState />}
        {items.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkRead={() => markRead(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};
