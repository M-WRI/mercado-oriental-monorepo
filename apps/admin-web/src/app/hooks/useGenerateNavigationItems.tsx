import { useTranslation } from "react-i18next";
import { routeConfig } from "../router/routeConfig";
import { NavivationItem } from "../components";
import type { TRouteConfig } from "../types/routes";

export const useGenerateNavigationItems = ({ isActive }: { isActive: boolean }) => {
  const { t } = useTranslation();

  const navigationItems = routeConfig
    ?.filter((route: TRouteConfig) => route.showInSidebar)
    .map((route: TRouteConfig) => ({
      path: route.index ? "/" : (route.path || ""),
      label: route.labelKey ? t(route.labelKey) : route.label,
      icon: route.icon,
    }));

  const NavigationItems = (
    <nav className="grid gap-1 w-full">
      {navigationItems?.map((item) => (
        <NavivationItem key={item.path} path={item.path || ""} label={item.label || ""} icon={item.icon || undefined} isActive={isActive} />
      ))}
    </nav>
  );

  return {
    NavigationItems,
  };
};
