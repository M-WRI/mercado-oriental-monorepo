import { useTranslation } from "react-i18next";

export function NotificationsEmptyState() {
  const { t } = useTranslation();
  return <p className="text-sm text-gray-400">{t("notifications.empty")}</p>;
}
