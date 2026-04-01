import { useState } from "react";
import { useNavigate } from "react-router";
import { usePost, useToast } from "@mercado/shared-ui";
import { useCart } from "../CartContext";
import { createOrderEndpoint } from "@/_modules/orders/api";
import type { CreateOrderPayload } from "@/_modules/orders/types";

export function CheckoutScreen() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { success } = useToast();
  const { mutate, isPending } = usePost<CreateOrderPayload, any>();
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  if (items.length === 0) {
    navigate("/cart", { replace: true });
    return null;
  }

  const shopGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  const shopEntries = Object.entries(shopGroups);

  const handlePlaceOrder = () => {
    let completed = 0;
    const total = shopEntries.length;

    for (const [, shopItems] of shopEntries) {
      const payload: CreateOrderPayload = {
        items: shopItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: shippingAddress.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
      };

      mutate(
        { url: createOrderEndpoint.url, data: payload },
        {
          onSuccess: () => {
            completed++;
            if (completed === total) {
              clearCart();
              success(total > 1 ? `${total} orders placed successfully!` : "Order placed successfully!");
              navigate("/orders", { replace: true });
            }
          },
        },
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order summary */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Order summary</h2>
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.variantId} className="py-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{item.productName}</span>
                <span className="text-xs text-gray-400 ml-2">({item.variantName}) × {item.quantity}</span>
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

      {shopEntries.length > 1 && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 mb-4">
          Your items are from {shopEntries.length} different shops. This will create {shopEntries.length} separate orders.
        </p>
      )}

      {/* Shipping + notes */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping address</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your shipping address..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Any special instructions..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
          />
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={isPending}
        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Placing order...
          </>
        ) : (
          "Place order"
        )}
      </button>
    </div>
  );
}
