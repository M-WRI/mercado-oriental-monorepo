import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth, Dropdown, DropdownHeader, DropdownItem, DropdownSeparator } from "@mercado/shared-ui";

export const Sidebar = ({
  children,
  isActive,
  toggle,
}: {
  children: React.ReactNode;
  isActive: boolean;
  toggle: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  const settingsPath = shopId ? `/s/${shopId}/settings` : "/shops";

  const userTrigger = (
    <button
      type="button"
      className={`w-full flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-gray-50 transition-colors ${
        isActive ? "" : "justify-center"
      }`}
    >
      <div className="w-[28px] h-[28px] rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-medium text-gray-600">{initials}</span>
      </div>
      {isActive && (
        <span className="text-sm text-gray-600 truncate text-left flex-1">
          {user?.name || user?.email}
        </span>
      )}
    </button>
  );

  return (
    <aside
      className={`${isActive ? "w-[220px]" : "w-[60px]"} h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-200 shrink-0`}
    >
      <div
        className="h-[56px] flex items-center gap-3 px-4 border-b border-gray-200 cursor-pointer shrink-0"
        onClick={toggle}
      >
        <div className="w-[28px] h-[28px] rounded-lg bg-black flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold">M</span>
        </div>
        {isActive && (
          <span className="text-sm font-semibold text-gray-900 truncate">Mercado Oriental</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2">{children}</div>

      <div className="border-t border-gray-200 px-2 py-3 shrink-0">
        <Dropdown trigger={userTrigger} side="right">
          <DropdownHeader>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || t("settings.unnamedUser")}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </DropdownHeader>
          <DropdownItem onClick={() => navigate(settingsPath)}>
            {t("settings.title")}
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem destructive onClick={logout}>
            {t("common.logout")}
          </DropdownItem>
        </Dropdown>
      </div>
    </aside>
  );
};
