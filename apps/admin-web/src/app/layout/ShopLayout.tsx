import { Outlet } from "react-router";
import { ProtectedRoute } from "@mercado/shared-ui";
import { ShopProvider } from "@/_modules/shops/context/ShopProvider";
import { DefaultLayout } from "./DefaultLayout";

export const ShopLayout = () => (
  <ProtectedRoute>
    <ShopProvider>
      <DefaultLayout />
    </ShopProvider>
  </ProtectedRoute>
);

export const MinimalAuthLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);
