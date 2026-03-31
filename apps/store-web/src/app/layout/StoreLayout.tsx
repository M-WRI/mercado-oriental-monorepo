import { Link, Outlet, useNavigate } from "react-router";
import { useAuth } from "@mercado/shared-ui";
import { useCart } from "@/_modules/cart/CartContext";

export function StoreLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-gray-900 tracking-tight">
            Mercado Oriental
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Products
            </Link>

            <Link to="/cart" className="relative text-sm text-gray-600 hover:text-gray-900">
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-4 bg-gray-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
                  Orders
                </Link>
                <Link to="/account" className="text-sm text-gray-600 hover:text-gray-900">
                  {user?.name || "Account"}
                </Link>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-900 hover:underline">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-gray-400">
          Mercado Oriental
        </div>
      </footer>
    </div>
  );
}
