import { useTranslation } from "react-i18next";
import { Button, Card, Tag } from "@mercado/shared-ui";
import { getNotificationTypeBadge } from "../utils";
import type { INotification } from "../types";

type NotificationCardProps = {
  notification: INotification;
  onMarkRead: () => void;
};

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const { t } = useTranslation();
  const badge = getNotificationTypeBadge(notification.type, t);
  const isRead = Boolean(notification.readAt);

  return (
    <Card className={isRead ? "opacity-60" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Tag variant={badge.variant} className="!text-[10px] uppercase tracking-wide">
              {badge.label}
            </Tag>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-2">{notification.title}</p>
          <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        {!isRead && (
          <Button style="link" className="!text-xs shrink-0" onClick={onMarkRead}>
            {t("notifications.markRead")}
          </Button>
        )}
      </div>
    </Card>
  );
}
