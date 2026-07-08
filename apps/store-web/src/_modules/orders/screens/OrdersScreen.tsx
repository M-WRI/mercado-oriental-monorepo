import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useFetch, Tag } from "@mercado/shared-ui";
import { orderStatusTabs, type OrderStatusFilter } from "@/_modules/account/config/accountNav";
import { ordersEndpoint } from "../api";
import type { OrderListResponse } from "../types";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  packed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

function activeStatus(params: URLSearchParams): OrderStatusFilter {
  const status = params.get("status");
  if (!status) return "all";
  return status as OrderStatusFilter;
}

export function OrdersScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const status = activeStatus(searchParams);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", "10");
  if (status !== "all") query.set("status", status);

  const { data, isLoading } = useFetch<OrderListResponse>({
    queryKey: [["store", "orders", query.toString()]],
    url: `${ordersEndpoint.url}?${query}`,
  });

  const setStatus = (next: OrderStatusFilter) => {
    setPage(1);
    setSearchParams(next === "all" ? {} : { status: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your orders</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-100 scrollbar-none">
          {orderStatusTabs.map((tab) => {
            const isActive = status === tab.status;
            return (
              <button
                key={tab.status}
                type="button"
                onClick={() => setStatus(tab.status)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  isActive
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-2">No orders in this view.</p>
          <Link to="/" className="text-sm font-medium text-gray-900 hover:underline">
            Browse products
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="space-y-3">
            {data.data.map((order, idx) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className={`block bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all product-card animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold truncate">#{order.id.slice(0, 8)}</span>
                    <Tag variant={statusVariant[order.status] ?? "default"} dot>
                      {order.status}
                    </Tag>
                  </div>
                  <span className="text-sm font-bold shrink-0">€{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-md bg-gray-800 flex items-center justify-center text-white text-[7px] font-bold">
                      {order.shop.name.charAt(0)}
                    </div>
                    {order.shop.name}
                  </span>
                  <span>·</span>
                  <span>
                    {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                  </span>
                  <span>·</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                {order.shippingAddress && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-1">{order.shippingAddress}</p>
                )}

                {order.trackingNumber && (
                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {order.trackingNumber}
                    {order.carrier && ` (${order.carrier})`}
                  </p>
                )}

                <p className="text-xs font-medium text-gray-900 mt-3">View order details →</p>
              </Link>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500 px-3">
                {page} of {data.meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page >= data.meta.totalPages}
                className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
