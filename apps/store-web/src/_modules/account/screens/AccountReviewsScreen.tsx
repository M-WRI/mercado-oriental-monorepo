import { Link } from "react-router";
import { useFetch } from "@mercado/shared-ui";
import { reviewsEndpoint } from "@/_modules/reviews/api";
import type { CustomerReviewListResponse } from "@/_modules/reviews/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export function AccountReviewsScreen() {
  const { data, isLoading } = useFetch<CustomerReviewListResponse>({
    queryKey: [["store", "reviews", "1"]],
    url: `${reviewsEndpoint.url}?page=1&limit=20`,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your reviews</h2>
        <p className="text-sm text-gray-500 mt-1">
          Reviews you have written. You can leave new reviews on delivered orders.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <p className="text-gray-500 font-medium mb-2">No reviews yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Purchase and receive products, then share your experience.
          </p>
          <Link
            to="/account/orders?status=delivered"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            View delivered orders
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <Link
                  to={`/products/${review.productId}`}
                  className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0"
                >
                  {review.product.imageUrl ? (
                    <img
                      src={review.product.imageUrl}
                      alt={review.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-light">
                      {review.product.name.charAt(0)}
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${review.productId}`}
                    className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-1"
                  >
                    {review.product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <p className="text-sm font-medium text-gray-800 mt-2">{review.title}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
                  {review.reply && (
                    <div className="mt-3 pl-3 border-l-2 border-gray-200 bg-gray-50 rounded-r-xl p-3">
                      <p className="text-xs font-semibold text-gray-900 mb-1">Shop reply</p>
                      <p className="text-sm text-gray-600">{review.reply.body}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
