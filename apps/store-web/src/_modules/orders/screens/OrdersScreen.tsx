import { useState } from "react";
import { Link } from "react-router";
import { useFetch, Tag } from "@mercado/shared-ui";
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

export function OrdersScreen() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useFetch<OrderListResponse>({
    queryKey: [["store", "orders", page.toString()]],
    url: `${ordersEndpoint.url}?page=${page}&limit=10`,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-2">No orders yet</p>
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Browse products</Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="space-y-3">
            {data.data.map((order, idx) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className={`block bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all product-card animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">#{order.id.slice(0, 8)}</span>
                    <Tag variant={statusVariant[order.status] ?? "default"} dot>
                      {order.status}
                    </Tag>
                  </div>
                  <span className="text-sm font-bold">€{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-md bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[7px] font-bold">
                      {order.shop.name.charAt(0)}
                    </div>
                    {order.shop.name}
                  </span>
                  <span>·</span>
                  <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {order.trackingNumber && (
                  <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {order.trackingNumber} {order.carrier && `(${order.carrier})`}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500 px-3">{page} of {data.meta.totalPages}</span>
              <button
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
