import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "@mercado/shared-ui";
import { StoreLayout } from "@/app/layout/StoreLayout";
import { ProductsScreen } from "@/_modules/products/screens/ProductsScreen";
import { ProductDetailScreen } from "@/_modules/products/screens/ProductDetailScreen";
import { CartScreen } from "@/_modules/cart/screens/CartScreen";
import { CheckoutScreen } from "@/_modules/cart/screens/CheckoutScreen";
import { OrdersScreen } from "@/_modules/orders/screens/OrdersScreen";
import { OrderDetailScreen } from "@/_modules/orders/screens/OrderDetailScreen";
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
    Component: StoreLayout,
    children: [
      {
        path: "/",
        Component: ProductsScreen,
      },
      {
        path: "/products/:id",
        Component: ProductDetailScreen,
      },
      {
        path: "/cart",
        Component: CartScreen,
      },
      {
        path: "/checkout",
        element: (
          <ProtectedRoute>
            <CheckoutScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "/orders",
        element: (
          <ProtectedRoute>
            <OrdersScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "/orders/:id",
        element: (
          <ProtectedRoute>
            <OrderDetailScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "/account",
        element: (
          <ProtectedRoute>
            <AccountScreen />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
