import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@mercado/shared-ui";
import { LoginScreen, RegisterScreen } from "@/_modules/auth/screens";
import { DefaultLayout } from "../layout";
import { routeConfig } from "./routeConfig";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/register",
    Component: RegisterScreen,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DefaultLayout />
      </ProtectedRoute>
    ),
    children: routeConfig,
  },
]);
