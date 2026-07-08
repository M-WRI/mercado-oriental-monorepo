import { Link, useSearchParams } from "react-router";
import { useEffect } from "react";
import { useFetch } from "@mercado/shared-ui";
import { checkoutStatusEndpoint } from "../api";
import { useCart } from "../CartContext";

export function CheckoutSuccessScreen() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";
  const { clearCart } = useCart();

  const { data, isLoading } = useFetch<{
    status: string;
    orders: { id: string }[];
  }>({
    queryKey: checkoutStatusEndpoint(sessionId).queryKey,
    url: checkoutStatusEndpoint(sessionId).url,
    enabled: Boolean(sessionId),
  });

  useEffect(() => {
    if (data?.status === "completed") {
      clearCart();
    }
  }, [data?.status, clearCart]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Payment successful</h1>
      {isLoading && <p className="text-sm text-gray-500">Confirming your order...</p>}
      {!isLoading && data?.status === "completed" && (
        <p className="text-sm text-gray-600 mb-6">Thank you! Your order has been placed.</p>
      )}
      {!isLoading && data?.status !== "completed" && (
        <p className="text-sm text-gray-600 mb-6">
          Payment received. Your order may take a moment to appear.
        </p>
      )}
      <Link
        to="/account/orders"
        className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold"
      >
        View my orders
      </Link>
    </div>
  );
}
