import { useState } from "react";
import { Link } from "react-router";
import { useFetch } from "@mercado/shared-ui";
import { productsEndpoint } from "../api";
import type { ProductListResponse } from "../types";

const GRADIENTS = [
  "gradient-placeholder-1",
  "gradient-placeholder-2",
  "gradient-placeholder-3",
  "gradient-placeholder-4",
  "gradient-placeholder-5",
  "gradient-placeholder-6",
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-xs tracking-tight">
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
      <div className="aspect-square skeleton rounded-xl" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-5 w-1/3" />
    </div>
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
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="hero-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 animate-fade-in-up">
            Discover Fresh Products
          </h1>
          <p className="text-white/70 text-sm sm:text-base mb-6 max-w-md animate-fade-in-up stagger-1">
            Explore unique goods from local vendors at Mercado Oriental.
          </p>
          <div className="relative max-w-md animate-fade-in-up stagger-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">
              {search ? "No products match your search" : "No products available yet"}
            </p>
            <p className="text-sm text-gray-400">
              {search ? "Try a different keyword." : "Check back soon!"}
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.data.map((product, idx) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className={`product-card bg-white border border-gray-100 rounded-2xl overflow-hidden group animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
                >
                  {/* Image placeholder */}
                  <div className={`aspect-square ${GRADIENTS[idx % GRADIENTS.length]} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-white/60 text-5xl font-light select-none group-hover:scale-110 transition-transform duration-500">
                      {product.name.charAt(0).toUpperCase()}
                    </span>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                          Out of stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400">{product.shop.name}</p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-sm font-bold text-gray-900">
                        {product.priceMin === product.priceMax
                          ? `€${product.priceMin.toFixed(2)}`
                          : `€${product.priceMin.toFixed(2)} – €${product.priceMax.toFixed(2)}`}
                      </span>
                    </div>

                    {product.avgRating !== null && (
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={product.avgRating} />
                        <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-30 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-500 px-3">
                  {page} of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page >= data.meta.totalPages}
                  className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-30 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
