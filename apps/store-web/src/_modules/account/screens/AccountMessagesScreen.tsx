import { Link } from "react-router";
import { useFetch, Tag } from "@mercado/shared-ui";
import { ordersEndpoint } from "@/_modules/orders/api";
import type { OrderListResponse } from "@/_modules/orders/types";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  packed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

export function AccountMessagesScreen() {
  const { data, isLoading } = useFetch<OrderListResponse>({
    queryKey: [["store", "orders", "messages-inbox"]],
    url: `${ordersEndpoint.url}?page=1&limit=20&sort=createdAt&order=desc`,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">
          Chat with vendors about your orders. Open an order to view and send messages.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <p className="text-gray-500 font-medium mb-2">No orders to message about yet</p>
          <Link to="/" className="text-sm font-medium text-gray-900 hover:underline">
            Browse products
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}#messages`}
              className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-bold">#{order.id.slice(0, 8)}</span>
                <Tag variant={statusVariant[order.status] ?? "default"} dot>
                  {order.status}
                </Tag>
              </div>
              <p className="text-sm text-gray-700">{order.shop.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} ·{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs font-medium text-gray-900 mt-3">Open conversation →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
