import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { routeConfig } from "../router/routeConfig";
import { NavivationItem } from "../components";
import type { TRouteConfig } from "../types/routes";

export const useGenerateNavigationItems = ({ isActive }: { isActive: boolean }) => {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const prefix = shopId ? `/s/${shopId}` : "";

  const navigationItems = routeConfig
    ?.filter((route: TRouteConfig) => route.showInSidebar)
    .map((route: TRouteConfig) => ({
      path: route.index ? prefix : `${prefix}/${route.path || ""}`,
      label: route.labelKey ? t(route.labelKey) : route.label,
      icon: route.icon,
      isIndex: Boolean(route.index),
    }));

  const NavigationItems = (
    <nav className="grid gap-1 w-full">
      {navigationItems?.map((item) => (
        <NavivationItem
          key={item.path}
          path={item.path || ""}
          label={item.label || ""}
          icon={item.icon || undefined}
          isActive={isActive}
          isIndex={item.isIndex}
        />
      ))}
    </nav>
  );

  return {
    NavigationItems,
  };
};
