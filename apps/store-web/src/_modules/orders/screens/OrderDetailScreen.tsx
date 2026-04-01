import { useState } from "react";
import { useParams, Link } from "react-router";
import { useFetch, usePost, Tag, useToast } from "@mercado/shared-ui";
import { orderDetailEndpoint, orderMessagesEndpoint, createMessageEndpoint } from "../api";
import type { OrderDetail, OrderMessage } from "../types";

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function OrderDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { success } = useToast();
  const endpoint = orderDetailEndpoint(id!);
  const msgEndpoint = orderMessagesEndpoint(id!);
  const [messageBody, setMessageBody] = useState("");

  const { data: order, isLoading } = useFetch<OrderDetail>({
    queryKey: endpoint.queryKey,
    url: endpoint.url,
    enabled: !!id,
  });

  const { data: messages, refetch: refetchMessages } = useFetch<OrderMessage[]>({
    queryKey: msgEndpoint.queryKey,
    url: msgEndpoint.url,
    enabled: !!id,
  });

  const { mutate: sendMessage, isPending: sendingMessage } = usePost<{ body: string }, OrderMessage>();

  const handleSendMessage = () => {
    if (!messageBody.trim()) return;
    const ep = createMessageEndpoint(id!);
    sendMessage(
      { url: ep.url, data: { body: messageBody.trim() } },
      {
        onSuccess: () => {
          setMessageBody("");
          refetchMessages();
          success("Message sent");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
        <div className="skeleton h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <p className="text-gray-500 font-medium mb-2">Order not found</p>
        <Link to="/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">← Back to orders</Link>
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All orders
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <Tag variant={statusVariant[order.status] ?? "default"} dot>{order.status}</Tag>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Shop</dt><dd className="font-medium">{order.shop.name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="font-bold text-lg">€{order.totalAmount.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Placed</dt><dd>{formatDate(order.createdAt)}</dd></div>
          </dl>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Shipping</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Address</dt><dd className="text-right max-w-[60%]">{order.shippingAddress || "—"}</dd></div>
            {order.trackingNumber && (
              <div className="flex justify-between"><dt className="text-gray-500">Tracking</dt><dd className="font-medium text-indigo-600">{order.trackingNumber}</dd></div>
            )}
            {order.carrier && (
              <div className="flex justify-between"><dt className="text-gray-500">Carrier</dt><dd>{order.carrier}</dd></div>
            )}
          </dl>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 1 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Timeline</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mb-1">
                    {i + 1}
                  </div>
                  <p className="text-xs font-medium">{step.label}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(step.date)}</p>
                </div>
                {i < timeline.length - 1 && (
                  <div className="w-8 h-0.5 bg-indigo-200 rounded mb-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.cancelReason && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-red-600"><strong>Cancellation reason:</strong> {order.cancelReason}</p>
        </div>
      )}

      {order.customerNote && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-indigo-600"><strong>Your note:</strong> {order.customerNote}</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold">Items ({order.items.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <div key={item.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.variantName}
                  {item.attributeSummary && ` · ${item.attributeSummary}`}
                  {" · "}×{item.quantity}
                </p>
              </div>
              <span className="text-sm font-bold">€{item.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold">Messages</h3>
        </div>
        <div className="p-5">
          {(!messages || messages.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-4">No messages yet. Send one to the vendor below.</p>
          )}
          {messages && messages.length > 0 && (
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] px-4 py-2.5 ${
                    msg.sender === "customer" ? "chat-bubble-customer" : "chat-bubble-vendor"
                  }`}>
                    <p className="text-sm">{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === "customer" ? "text-white/50" : "text-gray-400"}`}>
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageBody.trim()}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Review prompt for delivered orders */}
      {order.status === "delivered" && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">How was your order?</p>
          <p className="text-xs text-gray-500 mb-4">Leave a review on the products you purchased.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {order.items.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="text-xs px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Review {item.productName}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
