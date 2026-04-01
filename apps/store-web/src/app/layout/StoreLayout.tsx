import { Link, Outlet, useNavigate } from "react-router";
import { useAuth } from "@mercado/shared-ui";
import { useCart } from "@/_modules/cart/CartContext";

export function StoreLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      {/* Glassmorphism Header */}
      <header className="glass-header border-b border-gray-200/60 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow">
              M
            </div>
            <span className="text-lg font-semibold text-gray-900 tracking-tight hidden sm:inline">
              Mercado Oriental
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-lg transition-all"
            >
              Products
            </Link>

            <Link
              to="/cart"
              className="relative px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-lg transition-all flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm animate-pulse-once">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-lg transition-all flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="hidden sm:inline">Orders</span>
                </Link>
                <Link
                  to="/account"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 rounded-lg transition-all flex items-center gap-1"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs">{user?.name || "Account"}</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 rounded-lg transition-all"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="ml-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200/60 bg-white/60 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md hero-gradient flex items-center justify-center text-white text-[10px] font-bold">
                M
              </div>
              <span className="text-sm font-medium text-gray-500">Mercado Oriental</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <Link to="/" className="hover:text-gray-600 transition-colors">Products</Link>
              <Link to="/cart" className="hover:text-gray-600 transition-colors">Cart</Link>
              <Link to="/orders" className="hover:text-gray-600 transition-colors">Orders</Link>
              <Link to="/account" className="hover:text-gray-600 transition-colors">Account</Link>
            </div>
            <p className="text-xs text-gray-400">© 2026 Mercado Oriental</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
