import { useState } from "react";
import { Link } from "react-router";
import { useFetch } from "@mercado/shared-ui";
import { shopsEndpoint } from "../api";
import type { ShopListResponse } from "../types";

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

function ShopSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 skeleton rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-3">
        <div className="skeleton h-8 w-20 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  return `${years}y`;
}

export function ShopsScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "12");
  if (search.trim()) params.set("search", search.trim());

  const { data, isLoading } = useFetch<ShopListResponse>({
    queryKey: [["store", "shops", page.toString(), search]],
    url: `${shopsEndpoint.url}?${params}`,
  });

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 pb-6 pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Explore Vendors.
          </h1>
          
          <div className="relative max-w-xl mb-4 animate-fade-in-up stagger-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="shop-search-input"
              type="text"
              placeholder="Search shops..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Shop Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ShopSkeleton key={i} />
            ))}
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">
              {search ? "No shops match your search" : "No shops available yet"}
            </p>
            <p className="text-sm text-gray-400">
              {search ? "Try a different keyword." : "Check back soon!"}
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((shop, idx) => (
                <Link
                  key={shop.id}
                  to={`/shops/${shop.id}`}
                  id={`shop-card-${shop.id}`}
                  className={`shop-card bg-white border border-gray-100 rounded-2xl p-5 group animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {/* Shop avatar */}
                    <div className={`w-14 h-14 ${GRADIENTS[idx % GRADIENTS.length]} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                      <span className="text-white text-xl font-bold select-none">
                        {shop.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-gray-600 transition-colors">
                        {shop.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Selling for {timeAgo(shop.createdAt)}
                      </p>
                    </div>
                  </div>

                  {shop.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                      {shop.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-100">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {shop.productCount} {shop.productCount === 1 ? "product" : "products"}
                    </span>

                    {shop.avgRating !== null && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                        <StarRating rating={shop.avgRating} />
                        {shop.avgRating.toFixed(1)}
                      </span>
                    )}

                    {shop.reviewCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {shop.reviewCount} {shop.reviewCount === 1 ? "review" : "reviews"}
                      </span>
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
