import { Link } from "react-router";
import { Button, useAuth } from "@mercado/shared-ui";
import { useCart } from "../CartContext";

export function CartScreen() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mb-6">Browse products and add something you like.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-sm"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const shopGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.shopId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Cart ({totalItems})</h1>

      <div className="space-y-4">
        {Object.entries(shopGroups).map(([shopId, shopItems]) => (
          <div key={shopId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[8px] font-bold">
                {shopItems[0].shopName.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{shopItems[0].shopName}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {shopItems.map((item) => (
                <div key={item.variantId} className="px-5 py-4 flex items-center gap-4 group hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 block truncate transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
                  </div>

                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1.5 text-xs hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-2.5 py-1.5 text-xs font-semibold min-w-[1.5rem] text-center bg-gray-50">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-xs hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold w-20 text-right shrink-0">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-2xl font-bold">€{totalAmount.toFixed(2)}</span>
        </div>

        {Object.keys(shopGroups).length > 1 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mb-4">
            Items from different shops will be placed as separate orders.
          </p>
        )}

        {isAuthenticated ? (
          <Link to="/checkout">
            <Button fullWidth>Proceed to checkout</Button>
          </Link>
        ) : (
          <div className="space-y-3">
            <Link to="/login">
              <Button fullWidth>Sign in to checkout</Button>
            </Link>
            <p className="text-xs text-gray-400 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-500 hover:underline">Create one</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
