import { Link } from "react-router";
import { CategoryFilter } from "@/_modules/categories/components";
import { ProductGrid } from "@/_modules/products/components";
import { useProductsList } from "@/_modules/products/hooks";

export function ProductsScreen() {
  const {
    data,
    isLoading,
    isFetching,
    searchInput,
    categoryId,
    page,
    activeSort,
    sortOptions,
    hasFilters,
    setCategoryId,
    setSort,
    setPage,
    handleSearchChange,
    clearFilters,
  } = useProductsList();

  const selectedSortKey = `${activeSort.value}:${activeSort.order}`;

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100 pb-6 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Discover Products
          </h1>

          <div className="relative max-w-xl mb-6 animate-fade-in-up stagger-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all font-medium"
            />
          </div>

          <div className="lg:hidden animate-fade-in-up stagger-2">
            <CategoryFilter
              selectedId={categoryId}
              onSelect={setCategoryId}
              variant="chips"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Categories
              </h2>
              <CategoryFilter
                selectedId={categoryId}
                onSelect={setCategoryId}
                variant="sidebar"
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {data && (
                  <span>
                    <span className="font-semibold text-gray-800">{data.meta.total}</span> products
                  </span>
                )}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-gray-900 hover:underline font-medium text-xs"
                  >
                    Clear filters
                  </button>
                )}
                {isFetching && !isLoading && (
                  <span className="text-xs text-gray-400">Updating…</span>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600">
                Sort
                <select
                  value={selectedSortKey}
                  onChange={(e) => {
                    const [value, order] = e.target.value.split(":") as [
                      "createdAt" | "name",
                      "asc" | "desc",
                    ];
                    setSort(value, order);
                  }}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-50"
                >
                  {sortOptions.map((opt) => (
                    <option key={`${opt.value}:${opt.order}`} value={`${opt.value}:${opt.order}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {!isLoading && data && data.data.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium mb-1">No products found</p>
                <p className="text-sm text-gray-400 mb-4">
                  Try another category or search term.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    View all products
                  </button>
                )}
              </div>
            )}

            {(isLoading || (data && data.data.length > 0)) && (
              <ProductGrid products={data?.data ?? []} isLoading={isLoading} />
            )}

            {data && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 pb-4">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-30 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-500 px-3">
                  {page} of {data.meta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(data.meta.totalPages, page + 1))}
                  disabled={page >= data.meta.totalPages}
                  className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-30 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/shops", label: "Browse shops", desc: "Find vendors" },
            { to: "/cart", label: "Your cart", desc: "Checkout fast" },
            { to: "/account/orders", label: "Track orders", desc: "Order history" },
            { to: "/?sort=createdAt&order=desc", label: "New arrivals", desc: "Latest products" },
          ].map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all group"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
