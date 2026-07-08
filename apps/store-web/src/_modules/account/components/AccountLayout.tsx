import { Link, Outlet, useLocation } from "react-router";
import { useAuth } from "@mercado/shared-ui";
import { AccountSidebar } from "./AccountSidebar";

function breadcrumbLabel(pathname: string): string {
  if (pathname.startsWith("/account/orders/")) return "Order details";
  if (pathname.startsWith("/account/orders")) return "Your orders";
  if (pathname.startsWith("/account/reviews")) return "Your reviews";
  if (pathname.startsWith("/account/messages")) return "Messages";
  if (pathname.startsWith("/account/addresses")) return "Shipping addresses";
  if (pathname.startsWith("/account/profile")) return "Your profile";
  return "Account";
}

export function AccountLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const label = breadcrumbLabel(location.pathname);

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link to="/" className="hover:text-gray-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-600">{label}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account</h1>
          {user?.email && (
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm lg:sticky lg:top-24">
              <AccountSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
