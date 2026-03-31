import { Link } from "react-router";
import { Button, useAuth } from "@mercado/shared-ui";
import { useCart } from "../CartContext";

export function CartScreen() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mb-6">Browse products and add something you like.</p>
        <Link to="/" className="text-sm font-medium text-gray-900 hover:underline">Browse products</Link>
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Cart ({totalItems})</h1>

      <div className="space-y-6">
        {Object.entries(shopGroups).map(([shopId, shopItems]) => (
          <div key={shopId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500">{shopItems[0].shopName}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {shopItems.map((item) => (
                <div key={item.variantId} className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-medium text-gray-900 hover:underline block truncate"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-gray-400">{item.variantName}</p>
                  </div>

                  <div className="flex items-center border border-gray-200 rounded-lg shrink-0">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-30 rounded-l-lg"
                    >
                      −
                    </button>
                    <span className="px-2 py-1 text-xs font-medium min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-2 py-1 text-xs hover:bg-gray-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-medium w-20 text-right shrink-0">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-300 hover:text-red-500 text-sm shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-xl font-semibold">€{totalAmount.toFixed(2)}</span>
        </div>

        {Object.keys(shopGroups).length > 1 ? (
          <p className="text-xs text-amber-600 mb-3">
            Items from different shops will be placed as separate orders.
          </p>
        ) : null}

        {isAuthenticated ? (
          <Link to="/checkout">
            <Button fullWidth>Proceed to checkout</Button>
          </Link>
        ) : (
          <div className="space-y-2">
            <Link to="/login">
              <Button fullWidth>Sign in to checkout</Button>
            </Link>
            <p className="text-xs text-gray-400 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-gray-600 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
