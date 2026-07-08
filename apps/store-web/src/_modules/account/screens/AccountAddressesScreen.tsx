import { useMemo } from "react";
import { useFetch } from "@mercado/shared-ui";
import { ordersEndpoint } from "@/_modules/orders/api";
import type { OrderListResponse } from "@/_modules/orders/types";

export function AccountAddressesScreen() {
  const { data, isLoading } = useFetch<OrderListResponse>({
    queryKey: [["store", "orders", "addresses"]],
    url: `${ordersEndpoint.url}?page=1&limit=100&sort=createdAt&order=desc`,
  });

  const addresses = useMemo(() => {
    const map = new Map<string, { address: string; lastUsed: string; orderCount: number }>();

    for (const order of data?.data ?? []) {
      const address = order.shippingAddress?.trim();
      if (!address) continue;

      const existing = map.get(address);
      if (existing) {
        existing.orderCount += 1;
        if (new Date(order.createdAt) > new Date(existing.lastUsed)) {
          existing.lastUsed = order.createdAt;
        }
      } else {
        map.set(address, {
          address,
          lastUsed: order.createdAt,
          orderCount: 1,
        });
      }
    }

    return Array.from(map.values());
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Shipping addresses</h2>
        <p className="text-sm text-gray-500 mt-1">
          Addresses used on your past orders. Enter a new address at checkout.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && addresses.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <p className="text-gray-500 font-medium mb-2">No saved shipping addresses yet</p>
          <p className="text-sm text-gray-400">
            Your addresses will appear here after you place an order.
          </p>
        </div>
      )}

      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((entry) => (
            <div
              key={entry.address}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {entry.address}
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Used on {entry.orderCount} order{entry.orderCount !== 1 ? "s" : ""} · Last used{" "}
                {new Date(entry.lastUsed).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
