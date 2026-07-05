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
      <div className="bg-white border-b border-gray-100 pb-6 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Discover Furniture.
          </h1>
          
          <div className="relative max-w-xl mb-8 animate-fade-in-up stagger-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all font-medium"
            />
          </div>

          {/* Minimalist Category Pills (Visual Mockup based on screenshot) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none animate-fade-in-up stagger-2">
            <button className="px-5 py-2 text-sm font-medium rounded-full bg-gray-900 text-white shadow-sm shrink-0">
              All
            </button>
            {["Chair", "Sofa", "Lamp", "Cupboard", "Table", "Bed"].map((cat) => (
              <button key={cat} className="px-5 py-2 text-sm font-medium rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors shrink-0">
                {cat}
              </button>
            ))}
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
                  {/* Product image */}
                  <div className={`aspect-square relative overflow-hidden ${product.imageUrl ? "bg-gray-50" : GRADIENTS[idx % GRADIENTS.length]}`}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-white/60 text-5xl font-light select-none group-hover:scale-110 transition-transform duration-500">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                          Out of stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-1.5 bg-white">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                    <Link
                      to={`/shops/${product.shop.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {product.shop.name}
                    </Link>

                    {product.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.categories.slice(0, 2).map((c) => (
                          <span key={c.id} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                            {c.name}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="text-[10px] text-gray-400 font-medium">+{product.categories.length - 2}</span>
                        )}
                      </div>
                    )}

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
