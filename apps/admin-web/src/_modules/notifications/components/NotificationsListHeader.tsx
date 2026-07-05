import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

type NotificationsListHeaderProps = {
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllRead: () => void;
};

export function NotificationsListHeader({
  unreadCount,
  isMarkingAll,
  onMarkAllRead,
}: NotificationsListHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-6 shrink-0">
      <h4 className="text-lg font-semibold text-gray-900">{t("notifications.title")}</h4>
      <Button
        style="primaryOutline"
        disabled={unreadCount === 0 || isMarkingAll}
        onClick={onMarkAllRead}
      >
        {t("notifications.markAllRead")}
      </Button>
    </div>
  );
}
