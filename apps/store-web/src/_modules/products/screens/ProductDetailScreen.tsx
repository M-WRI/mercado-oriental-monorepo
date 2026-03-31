import { useState } from "react";
import { useParams, Link } from "react-router";
import { useFetch, Button, useToast } from "@mercado/shared-ui";
import { productDetailEndpoint } from "../api";
import { useCart } from "@/_modules/cart/CartContext";
import type { ProductDetail, ProductVariant } from "../types";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-lg" : "text-sm";
  return (
    <span className={`text-amber-400 ${cls} tracking-tight`}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function ProductDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { success } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const endpoint = productDetailEndpoint(id!);
  const { data: product, isLoading } = useFetch<ProductDetail>({
    queryKey: endpoint.queryKey,
    url: endpoint.url,
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-sm text-gray-400">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/" className="text-sm font-medium text-gray-900 hover:underline">Back to products</Link>
      </div>
    );
  }

  const variant = selectedVariant ?? product.variants[0] ?? null;

  const handleAddToCart = () => {
    if (!variant || !variant.inStock) return;
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantName: variant.name,
      price: variant.price,
      shopId: product.shop.id,
      shopName: product.shop.name,
    }, quantity);
    success(`Added ${product.name} to cart.`);
    setQuantity(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">&larr; All products</Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image placeholder */}
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-4xl font-light">
          {product.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">{product.shop.name}</p>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
          </div>

          {product.avgRating !== null && (
            <div className="flex items-center gap-2">
              <StarRating rating={product.avgRating} size="lg" />
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>
          )}

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Variant selector */}
          {product.variants.length > 1 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                    className={`text-sm px-3 py-1.5 border rounded-lg transition-colors ${
                      variant?.id === v.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : v.inStock
                          ? "border-gray-200 hover:border-gray-400"
                          : "border-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!v.inStock}
                  >
                    {v.name}
                    {v.attributes.length > 0 && (
                      <span className="text-[10px] ml-1 opacity-60">
                        ({v.attributes.map((a) => a.value).join(", ")})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price + add to cart */}
          {variant && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">€{variant.price.toFixed(2)}</span>
                {!variant.inStock && (
                  <span className="text-xs text-red-500 font-medium">Out of stock</span>
                )}
              </div>

              {variant.inStock && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-l-lg"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(variant.available, q + 1))}
                      className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                  <Button onClick={handleAddToCart}>Add to cart</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Reviews ({product.reviewCount})</h2>
          <div className="space-y-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={r.rating} />
                  {r.title && <span className="text-sm font-medium">{r.title}</span>}
                </div>
                <p className="text-sm text-gray-600 mb-2">{r.body}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{r.customerName ?? "Customer"}</span>
                  <span>·</span>
                  <span>{timeAgo(r.createdAt)}</span>
                </div>
                {r.reply && (
                  <div className="mt-3 pl-3 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-600">{r.reply.body}</p>
                    <p className="text-xs text-gray-400 mt-1">Shop reply · {timeAgo(r.reply.createdAt)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
