import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { MdLogout, MdNotificationsNone } from "react-icons/md";
import { Button, useAuth, useFetch } from "@mercado/shared-ui";
import { getNotifications } from "@/_modules/notifications/api";
import type { INotification } from "@/_modules/notifications/types";

const languages = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "zh", label: "中文" },
];

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: notifications } = useFetch<INotification[]>({
    queryKey: getNotifications.queryKey,
    url: getNotifications.url,
  });

  const unreadCount = (notifications ?? []).filter((n: INotification) => !n.readAt).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-[56px] w-full flex justify-end items-center gap-3 px-6 border-b border-gray-200 bg-white shrink-0">
      <button
        type="button"
        onClick={() => navigate("/notifications")}
        className="relative p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label={t("notifications.title")}
      >
        <MdNotificationsNone size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              i18n.language === lang.code ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
      <Button onClick={handleLogout} style="link" icon={<MdLogout size={16} />}>
        {t("common.logout")}
      </Button>
    </div>
  );
};
