import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "@mercado/shared-ui";
import { AccountScreen } from "@/_modules/account/screens/AccountScreen";
import { LoginScreen } from "@/_modules/auth/screens/LoginScreen";
import { RegisterScreen } from "@/_modules/auth/screens/RegisterScreen";

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
        <AccountScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
