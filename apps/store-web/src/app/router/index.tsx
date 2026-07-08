import { createBrowserRouter, Navigate, useParams } from "react-router";
import { ProtectedRoute } from "@mercado/shared-ui";
import { StoreLayout } from "@/app/layout/StoreLayout";
import { AccountLayout } from "@/_modules/account/components";
import { AccountProfileScreen, AccountReviewsScreen, AccountMessagesScreen, AccountAddressesScreen } from "@/_modules/account/screens";
import { ProductsScreen } from "@/_modules/products/screens/ProductsScreen";
import { ProductDetailScreen } from "@/_modules/products/screens/ProductDetailScreen";
import { ShopsScreen } from "@/_modules/shops/screens/ShopsScreen";
import { ShopDetailScreen } from "@/_modules/shops/screens/ShopDetailScreen";
import { CartScreen } from "@/_modules/cart/screens/CartScreen";
import { CheckoutScreen } from "@/_modules/cart/screens/CheckoutScreen";
import { CheckoutSuccessScreen } from "@/_modules/cart/screens/CheckoutSuccessScreen";
import { CheckoutCancelScreen } from "@/_modules/cart/screens/CheckoutCancelScreen";
import { OrdersScreen } from "@/_modules/orders/screens/OrdersScreen";
import { OrderDetailScreen } from "@/_modules/orders/screens/OrderDetailScreen";
import { LoginScreen } from "@/_modules/auth/screens/LoginScreen";
import { RegisterScreen } from "@/_modules/auth/screens/RegisterScreen";

function LegacyOrderRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/account/orders/${id}`} replace />;
}

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
        path: "/shops",
        Component: ShopsScreen,
      },
      {
        path: "/shops/:id",
        Component: ShopDetailScreen,
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
        path: "/checkout/success",
        element: (
          <ProtectedRoute>
            <CheckoutSuccessScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "/checkout/cancel",
        Component: CheckoutCancelScreen,
      },
      {
        path: "/account",
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="orders" replace />,
          },
          {
            path: "orders",
            Component: OrdersScreen,
          },
          {
            path: "orders/:id",
            Component: OrderDetailScreen,
          },
          {
            path: "reviews",
            Component: AccountReviewsScreen,
          },
          {
            path: "messages",
            Component: AccountMessagesScreen,
          },
          {
            path: "addresses",
            Component: AccountAddressesScreen,
          },
          {
            path: "profile",
            Component: AccountProfileScreen,
          },
        ],
      },
      {
        path: "/orders",
        element: <Navigate to="/account/orders" replace />,
      },
      {
        path: "/orders/:id",
        element: <LegacyOrderRedirect />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
