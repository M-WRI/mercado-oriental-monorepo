import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from "react-router/dom";
import { AuthProvider, ErrorBoundary, ToastProvider, initApiClient, serializeApiError } from "@mercado/shared-ui";
import { router } from './app/router';
import i18n from './i18n';
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

initApiClient({
  baseURL: import.meta.env.VITE_API_URL,
  getToken: () => localStorage.getItem("userToken"),
  onUnauthorized: () => localStorage.removeItem("userToken"),
  serializeError: (error) =>
    serializeApiError(error, {
      fallback: i18n.t("errors.fallback"),
      getMessage: (key) => i18n.t(key),
    }),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider tokenStorageKey="userToken" meUrl="/auth/me">
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
