import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { accountNavItems, type OrderStatusFilter } from "../config/accountNav";

function OrdersIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function ReviewsIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function AddressesIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

const icons: Record<string, () => ReactNode> = {
  orders: OrdersIcon,
  reviews: ReviewsIcon,
  messages: MessagesIcon,
  addresses: AddressesIcon,
  cart: CartIcon,
  profile: ProfileIcon,
};

function activeOrderStatus(searchParams: URLSearchParams): OrderStatusFilter {
  const status = searchParams.get("status");
  if (!status) return "all";
  return status as OrderStatusFilter;
}

function navItemClass(isActive: boolean) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive
      ? "bg-gray-100 text-gray-900"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  }`;
}

export function AccountSidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [ordersOpen, setOrdersOpen] = useState(
    location.pathname.startsWith("/account/orders"),
  );

  const currentStatus = activeOrderStatus(searchParams);

  return (
    <nav className="space-y-1">
      {accountNavItems.map((item) => {
        const Icon = icons[item.id];
        const isOrders = item.id === "orders";
        const isActive = isOrders
          ? location.pathname.startsWith("/account/orders")
          : item.external
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

        if (isOrders && item.children) {
          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => setOrdersOpen((open) => !open)}
                className={`w-full ${navItemClass(isActive)}`}
              >
                {Icon?.()}
                <span className="flex-1 text-left">{item.label}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${ordersOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {ordersOpen && (
                <ul className="mt-1 ml-4 pl-3 border-l border-gray-100 space-y-0.5">
                  {item.children.map((child) => {
                    const childActive =
                      location.pathname.startsWith("/account/orders") &&
                      !location.pathname.match(/\/account\/orders\/[^/]+/) &&
                      currentStatus === child.status;

                    return (
                      <li key={child.to}>
                        <Link
                          to={child.to}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            childActive
                              ? "text-gray-900 font-semibold bg-gray-50"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            to={item.to}
            end={item.end}
            className={navItemClass(isActive)}
          >
            {Icon?.()}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
