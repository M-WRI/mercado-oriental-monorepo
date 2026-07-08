import { Link } from "react-router";
import type { ProductListItem } from "../types";

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

interface ProductCardProps {
  product: ProductListItem;
  index?: number;
  compact?: boolean;
}

export function ProductCard({ product, index = 0, compact = false }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.id}`}
      className={`product-card bg-white border border-gray-100 rounded-2xl overflow-hidden group animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
    >
      <div
        className={`relative overflow-hidden ${product.imageUrl ? "bg-gray-50" : GRADIENTS[index % GRADIENTS.length]} ${compact ? "aspect-[4/5]" : "aspect-square"}`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
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

      <div className={`${compact ? "p-3" : "p-4"} space-y-1.5 bg-white`}>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        {!compact && (
          <Link
            to={`/shops/${product.shop.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors block truncate"
          >
            {product.shop.name}
          </Link>
        )}

        {product.categories?.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1">
            {product.categories.slice(0, 2).map((c) => (
              <span
                key={c.id}
                className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium"
              >
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
  );
}
