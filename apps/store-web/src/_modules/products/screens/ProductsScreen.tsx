import { useState } from "react";
import { Link } from "react-router";
import { useFetch } from "@mercado/shared-ui";
import { productsEndpoint } from "../api";
import type { ProductListResponse } from "../types";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-xs tracking-tight">
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export function ProductsScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "12");
  if (search.trim()) params.set("search", search.trim());

  const { data, isLoading } = useFetch<ProductListResponse>({
    queryKey: [["store", "products", page.toString(), search]],
    url: `${productsEndpoint.url}?${params}`,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-gray-400"
        />
      </div>

      {isLoading && (
        <div className="text-sm text-gray-400 py-12 text-center">Loading products...</div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-sm text-gray-400 py-12 text-center">
          {search ? "No products match your search." : "No products available yet."}
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.data.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-300 text-xs">
                  {product.name.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:underline line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400">{product.shop.name}</p>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {product.priceMin === product.priceMax
                        ? `€${product.priceMin.toFixed(2)}`
                        : `€${product.priceMin.toFixed(2)} – €${product.priceMax.toFixed(2)}`}
                    </span>
                    {!product.inStock && (
                      <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        Out of stock
                      </span>
                    )}
                  </div>

                  {product.avgRating !== null && (
                    <div className="flex items-center gap-1">
                      <StarRating rating={product.avgRating} />
                      <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm px-3 py-1 border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                {page} of {data.meta.totalPages}
              </span>
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
