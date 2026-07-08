import type { ProductListItem } from "../types";
import { ProductCard } from "./ProductCard";

function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: ProductListItem[];
  isLoading?: boolean;
  compact?: boolean;
}

export function ProductGrid({ products, isLoading, compact }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={idx} compact={compact} />
      ))}
    </div>
  );
}
