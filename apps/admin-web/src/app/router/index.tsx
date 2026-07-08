import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "@mercado/shared-ui";
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, ResetPasswordScreen } from "@/_modules/auth/screens";
import { ShopPickerScreen, CreateShopScreen, EditShopScreen } from "@/_modules/shops/screens";
import { ShopLayout, MinimalAuthLayout } from "../layout/ShopLayout";
import { routeConfig } from "./routeConfig";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordScreen,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordScreen,
  },
  {
    path: "/register",
    Component: RegisterScreen,
  },
  {
    path: "/shops",
    element: <MinimalAuthLayout />,
    children: [
      { index: true, Component: ShopPickerScreen },
      { path: "new", Component: CreateShopScreen },
      { path: ":shopId/edit", Component: EditShopScreen },
    ],
  },
  {
    path: "/s/:shopId",
    element: <ShopLayout />,
    children: routeConfig,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Navigate to="/shops" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: (
      <ProtectedRoute>
        <Navigate to="/shops" replace />
      </ProtectedRoute>
    ),
  },
]);
