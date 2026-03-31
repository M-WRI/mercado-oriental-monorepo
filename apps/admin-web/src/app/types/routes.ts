import type { RouteObject } from "react-router";

export type TRouteConfig = RouteObject & {
  showInSidebar?: boolean;
  label: string;
  labelKey?: string;
  icon?: React.ReactNode;
};
