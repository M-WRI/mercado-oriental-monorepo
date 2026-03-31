import { useParams, Link } from "react-router";
import { useFetch, Tag } from "@mercado/shared-ui";
import { orderDetailEndpoint } from "../api";
import type { OrderDetail } from "../types";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  packed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleString();
}

export function OrderDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const endpoint = orderDetailEndpoint(id!);

  const { data: order, isLoading } = useFetch<OrderDetail>({
    queryKey: endpoint.queryKey,
    url: endpoint.url,
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-400">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Order not found.</p>
        <Link to="/orders" className="text-sm font-medium text-gray-900 hover:underline">Back to orders</Link>
      </div>
    );
  }

  const timeline = [
    { label: "Placed", date: order.createdAt },
    { label: "Confirmed", date: order.confirmedAt },
    { label: "Packed", date: order.packedAt },
    { label: "Shipped", date: order.shippedAt },
    { label: "Delivered", date: order.deliveredAt },
  ].filter((s) => s.date);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">&larr; All orders</Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Order #{order.id.slice(0, 8)}</h1>
        <Tag variant={statusVariant[order.status] ?? "default"} dot>{order.status}</Tag>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-medium text-gray-400 mb-2">Details</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Shop</dt><dd>{order.shop.name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="font-semibold">€{order.totalAmount.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Placed</dt><dd>{formatDate(order.createdAt)}</dd></div>
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-medium text-gray-400 mb-2">Shipping</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Address</dt><dd className="text-right">{order.shippingAddress || "—"}</dd></div>
            {order.trackingNumber && (
              <div className="flex justify-between"><dt className="text-gray-500">Tracking</dt><dd>{order.trackingNumber}</dd></div>
            )}
            {order.carrier && (
              <div className="flex justify-between"><dt className="text-gray-500">Carrier</dt><dd>{order.carrier}</dd></div>
            )}
          </dl>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-medium text-gray-400 mb-3">Timeline</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-xs font-medium">{step.label}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(step.date)}</p>
                </div>
                {i < timeline.length - 1 && <span className="text-gray-300">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.cancelReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-600"><strong>Cancellation reason:</strong> {order.cancelReason}</p>
        </div>
      )}

      {order.customerNote && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-600"><strong>Your note:</strong> {order.customerNote}</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium">Items ({order.items.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-gray-400">
                  {item.variantName}
                  {item.attributeSummary && ` · ${item.attributeSummary}`}
                  {" · "}×{item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">€{item.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
