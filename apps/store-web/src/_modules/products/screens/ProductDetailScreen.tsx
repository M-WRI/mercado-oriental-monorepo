import { useState } from "react";
import { useParams, Link } from "react-router";
import { useFetch, usePost, useToast, useAuth } from "@mercado/shared-ui";
import { productDetailEndpoint } from "../api";
import { useCart } from "@/_modules/cart/CartContext";
import type { ProductDetail, ProductVariant } from "../types";

const GRADIENTS = [
  "gradient-placeholder-1",
  "gradient-placeholder-2",
  "gradient-placeholder-3",
  "gradient-placeholder-4",
  "gradient-placeholder-5",
  "gradient-placeholder-6",
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className={`text-amber-400 ${cls} tracking-tight`}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function InteractiveStarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`text-2xl transition-colors ${
            star <= (hover || value) ? "text-amber-400" : "text-gray-200"
          } hover:scale-110 transition-transform`}
        >
          ★
        </button>
      ))}
    </div>
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
  const { isAuthenticated } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const { mutate: submitReview, isPending: reviewPending } = usePost<any, any>();

  const endpoint = productDetailEndpoint(id!);
  const { data: product, isLoading, refetch } = useFetch<ProductDetail>({
    queryKey: endpoint.queryKey,
    url: endpoint.url,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-8 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-12 w-1/2 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-2">Product not found</p>
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">← Back to products</Link>
      </div>
    );
  }

  const variant = selectedVariant ?? product.variants[0] ?? null;
  const gradientIdx = product.name.charCodeAt(0) % GRADIENTS.length;

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
    success(`Added ${product.name} to cart`);
    setQuantity(1);
  };

  const handleSubmitReview = () => {
    if (reviewRating < 1 || !reviewBody.trim()) return;
    submitReview(
      {
        url: `/products/${product.id}/reviews`,
        data: { rating: reviewRating, title: reviewTitle.trim() || undefined, body: reviewBody.trim() },
      },
      {
        onSuccess: () => {
          success("Review submitted!");
          setShowReviewForm(false);
          setReviewRating(0);
          setReviewTitle("");
          setReviewBody("");
          refetch();
        },
      }
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className={`aspect-square ${GRADIENTS[gradientIdx]} rounded-2xl flex items-center justify-center shadow-lg animate-fade-in-up`}>
            <span className="text-white/50 text-8xl font-light select-none">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="space-y-5 animate-fade-in-up stagger-1">
            <div>
              <p className="text-xs font-medium text-indigo-500 mb-1 uppercase tracking-wider">{product.shop.name}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
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
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                      className={`text-sm px-4 py-2 border-2 rounded-xl transition-all ${
                        variant?.id === v.id
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                          : v.inStock
                            ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
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

            {/* Price + Add to cart */}
            {variant && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">€{variant.price.toFixed(2)}</span>
                  {variant.inStock ? (
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                      In stock · {variant.available} left
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                      Out of stock
                    </span>
                  )}
                </div>

                {variant.inStock && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 text-sm font-semibold min-w-[2.5rem] text-center bg-gray-50">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(variant.available, q + 1))}
                        className="px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to cart
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Reviews ({product.reviewCount})</h2>
            {isAuthenticated && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="text-sm px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Write a review
              </button>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm animate-slide-down">
              <h3 className="text-sm font-semibold mb-4">Your Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Rating</label>
                  <InteractiveStarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title (optional)</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Sum it up..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Review</label>
                  <textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewPending || reviewRating < 1 || !reviewBody.trim()}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-all"
                  >
                    {reviewPending ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {product.reviews.length === 0 && !showReviewForm && (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}

          {product.reviews.length > 0 && (
            <div className="space-y-3">
              {product.reviews.map((r) => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5 transition-all hover:border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                      {(r.customerName ?? "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.customerName ?? "Customer"}</span>
                        <span className="text-xs text-gray-400">· {timeAgo(r.createdAt)}</span>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                  </div>
                  {r.title && <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>}
                  <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
                  {r.reply && (
                    <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-xl p-3">
                      <p className="text-xs font-medium text-indigo-600 mb-1">Shop Reply · {timeAgo(r.reply.createdAt)}</p>
                      <p className="text-sm text-gray-600">{r.reply.body}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
