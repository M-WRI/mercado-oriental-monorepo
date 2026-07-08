import { useState } from "react";
import { useNavigate } from "react-router";
import { usePost, useToast } from "@mercado/shared-ui";
import { useCart } from "../CartContext";
import { createCheckoutEndpoint } from "../api";

interface CheckoutItem {
  variantId: string;
  quantity: number;
}

interface CreateCheckoutPayload {
  items: CheckoutItem[];
  shippingAddress?: string;
  customerNote?: string;
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export function CheckoutScreen() {
  const { items, totalAmount } = useCart();
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const { mutate, isPending } = usePost<CreateCheckoutPayload, CreateCheckoutResponse>();
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  if (items.length === 0) {
    navigate("/cart", { replace: true });
    return null;
  }

  const shopIds = [...new Set(items.map((i) => i.shopId))];

  const handleCheckout = () => {
    const payload: CreateCheckoutPayload = {
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      shippingAddress: shippingAddress.trim() || undefined,
      customerNote: customerNote.trim() || undefined,
    };

    mutate(
      { url: createCheckoutEndpoint.url, data: payload },
      {
        onSuccess: (data) => {
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          }
        },
        onError: () => {
          toastError("Checkout failed. Please try again.");
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Order summary</h2>
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.variantId} className="py-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{item.productName}</span>
                <span className="text-xs text-gray-400 ml-2">
                  ({item.variantName}) × {item.quantity}
                </span>
              </div>
              <span className="text-sm font-bold">€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 mt-2 flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold">€{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {shopIds.length > 1 && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 mb-4">
          Your items are from {shopIds.length} different shops. You will pay once and orders are split automatically.
        </p>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping address</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your shipping address..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 resize-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Any special instructions..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 resize-none transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isPending}
        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? "Redirecting to payment..." : "Pay with card"}
      </button>
    </div>
  );
}
