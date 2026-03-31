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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      {isLoading && <p className="text-sm text-gray-400 py-12 text-center">Loading orders...</p>}

      {data && data.data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="text-sm font-medium text-gray-900 hover:underline">Browse products</Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="space-y-3">
            {data.data.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{order.id.slice(0, 8)}</span>
                    <Tag variant={statusVariant[order.status] ?? "default"} dot>
                      {order.status}
                    </Tag>
                  </div>
                  <span className="text-sm font-semibold">€{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{order.shop.name}</span>
                  <span>·</span>
                  <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {order.trackingNumber && (
                  <p className="text-xs text-blue-600 mt-1">
                    Tracking: {order.trackingNumber} {order.carrier && `(${order.carrier})`}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm px-3 py-1 border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">{page} of {data.meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page >= data.meta.totalPages}
                className="text-sm px-3 py-1 border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
