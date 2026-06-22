import { useParams, Link } from "react-router";
import { useFetch } from "@mercado/shared-ui";
import { shopDetailEndpoint } from "../api";
import type { ShopDetail } from "../types";

const GRADIENTS = [
  "gradient-placeholder-1",
  "gradient-placeholder-2",
  "gradient-placeholder-3",
  "gradient-placeholder-4",
  "gradient-placeholder-5",
  "gradient-placeholder-6",
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-xl" : "text-xs";
  return (
    <span className={`text-amber-400 ${cls} tracking-tight`}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export function ShopDetailScreen() {
  const { id } = useParams<{ id: string }>();

  const endpoint = shopDetailEndpoint(id!);
  const { data: shop, isLoading } = useFetch<ShopDetail>({
    queryKey: endpoint.queryKey,
    url: endpoint.url,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="shop-hero-gradient text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl skeleton opacity-30" />
              <div className="space-y-3 flex-1">
                <div className="skeleton h-8 w-1/3 opacity-30" />
                <div className="skeleton h-4 w-1/4 opacity-30" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="aspect-square skeleton rounded-xl" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-5 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-2">Shop not found</p>
        <Link to="/shops" className="text-sm font-medium text-gray-900 hover:text-gray-700">← Browse all shops</Link>
      </div>
    );
  }



  return (
    <div className="animate-fade-in">
      {/* Shop Profile Hero */}
      <div className="bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
          <Link to="/shops" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All shops
          </Link>

          <div className="flex items-center gap-5 animate-fade-in-up">
            {/* Shop avatar */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl`}>
              <span className="text-white text-3xl sm:text-4xl font-bold select-none">
                {shop.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 truncate text-gray-900">{shop.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                {shop.avgRating !== null && (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={shop.avgRating} size="lg" />
                    <span className="text-sm text-gray-600 font-medium">{shop.avgRating.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-sm text-gray-400">
                  Member since {formatDate(shop.memberSince)}
                </span>
              </div>
            </div>
          </div>

          {shop.description && (
            <p className="mt-4 text-sm text-gray-600 max-w-2xl leading-relaxed animate-fade-in-up stagger-1">
              {shop.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 -mt-6 relative z-10 animate-fade-in-up stagger-2">
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            value={String(shop.productCount)}
            label={shop.productCount === 1 ? "Product" : "Products"}
          />
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
            value={shop.avgRating !== null ? shop.avgRating.toFixed(1) : "—"}
            label="Avg. Rating"
          />
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            value={String(shop.reviewCount)}
            label={shop.reviewCount === 1 ? "Review" : "Reviews"}
          />
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            value={formatDate(shop.memberSince)}
            label="Member Since"
          />
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up stagger-3">
          <h2 className="text-xl font-bold text-gray-900">
            Products
            <span className="text-sm font-normal text-gray-400 ml-2">({shop.productCount})</span>
          </h2>
        </div>

        {/* Products */}
        {shop.products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">No products yet</p>
            <p className="text-sm text-gray-400">This shop hasn't listed any products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shop.products.map((product, idx) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                id={`shop-product-${product.id}`}
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

                <div className="p-4 space-y-1.5 bg-white">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-600 transition-colors">
                    {product.name}
                  </h3>

                  {product.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.categories.slice(0, 2).map((c) => (
                        <span key={c.id} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {c.name}
                        </span>
                      ))}
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
        )}
      </div>
    </div>
  );
}
