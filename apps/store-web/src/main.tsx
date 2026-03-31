import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import { AuthProvider, ErrorBoundary, ToastProvider, initApiClient, serializeApiError } from "@mercado/shared-ui";
import { CartProvider } from "@/_modules/cart/CartContext";
import { router } from "@/app/router";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

initApiClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  getToken: () => localStorage.getItem("customerToken"),
  onUnauthorized: () => localStorage.removeItem("customerToken"),
  serializeError: (error) => serializeApiError(error, { fallback: "Something went wrong." }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider tokenStorageKey="customerToken" meUrl="/store/auth/me">
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
