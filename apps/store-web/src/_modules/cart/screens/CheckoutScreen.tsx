import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, usePost, useToast } from "@mercado/shared-ui";
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
              success(total > 1 ? `${total} orders placed successfully.` : "Order placed successfully.");
              navigate("/orders", { replace: true });
            }
          },
        },
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      {/* Order summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Order summary</h2>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.variantId} className="py-2 flex items-center justify-between">
              <div>
                <span className="text-sm">{item.productName}</span>
                <span className="text-xs text-gray-400 ml-1">({item.variantName}) × {item.quantity}</span>
              </div>
              <span className="text-sm font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-3 mt-2 flex items-center justify-between">
          <span className="font-medium">Total</span>
          <span className="text-lg font-semibold">€{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {shopEntries.length > 1 && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
          Your items are from {shopEntries.length} different shops. This will create {shopEntries.length} separate orders.
        </p>
      )}

      {/* Shipping + notes */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping address</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your shipping address..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Any special instructions..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>
      </div>

      <Button onClick={handlePlaceOrder} disabled={isPending} fullWidth>
        {isPending ? "Placing order..." : "Place order"}
      </Button>
    </div>
  );
}
