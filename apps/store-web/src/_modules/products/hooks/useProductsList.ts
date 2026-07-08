import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useFetch } from "@mercado/shared-ui";
import { categoriesEndpoint } from "@/_modules/categories/api";
import { flattenCategories } from "@/_modules/categories/utils/flattenCategories";
import type { Category } from "@/_modules/categories/types";
import { productsEndpoint } from "../api";
import type { ProductListResponse } from "../types";

export type ProductSort = "createdAt" | "name";
export type ProductSortOrder = "asc" | "desc";

const SORT_OPTIONS: { value: ProductSort; label: string; order: ProductSortOrder }[] = [
  { value: "createdAt", label: "Newest", order: "desc" },
  { value: "createdAt", label: "Oldest", order: "asc" },
  { value: "name", label: "Name A–Z", order: "asc" },
  { value: "name", label: "Name Z–A", order: "desc" },
];

export function useProductsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryId = searchParams.get("categoryId") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const sort = (searchParams.get("sort") as ProductSort) || "createdAt";
  const order = (searchParams.get("order") as ProductSortOrder) || "desc";
  const searchFromUrl = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sortKey = `${sort}:${order}`;
  const activeSort =
    SORT_OPTIONS.find((o) => `${o.value}:${o.order}` === sortKey) ??
    SORT_OPTIONS[0];

  const { data: categories = [] } = useFetch<Category[]>({
    queryKey: categoriesEndpoint.queryKey,
    url: categoriesEndpoint.url,
  });

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  // Keep search input aligned with URL (back/forward, deep links)
  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  // Debounce search → API value + URL (preserve category/page/sort params)
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch(trimmed);
      setSearchParams(
        (prev) => {
          const prevSearch = prev.get("search") ?? "";
          if (trimmed === prevSearch) return prev;

          const next = new URLSearchParams(prev);
          if (trimmed) next.set("search", trimmed);
          else next.delete("search");
          next.set("page", "1");
          return next;
        },
        { replace: true },
      );
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, setSearchParams]);

  // Drop stale categoryId after re-seed or invalid deep links
  useEffect(() => {
    if (!categoryId || flatCategories.length === 0) return;
    if (!flatCategories.some((c) => c.id === categoryId)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("categoryId");
          return next;
        },
        { replace: true },
      );
    }
  }, [categoryId, flatCategories, setSearchParams]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    params.set("sort", sort);
    params.set("order", order);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (categoryId && flatCategories.some((c) => c.id === categoryId)) {
      params.set("categoryId", categoryId);
    }
    return params.toString();
  }, [page, sort, order, debouncedSearch, categoryId, flatCategories]);

  const { data, isLoading, isFetching } = useFetch<ProductListResponse>({
    queryKey: [["store", "products", queryString]],
    url: `${productsEndpoint.url}?${queryString}`,
  });

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === "") next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setCategoryId = (id: string | null) => {
    updateParams({ categoryId: id, page: "1" });
  };

  const setSort = (value: ProductSort, sortOrder: ProductSortOrder) => {
    updateParams({ sort: value, order: sortOrder, page: "1" });
  };

  const setPage = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSearchParams({}, { replace: true });
  };

  const hasFilters = Boolean(categoryId || debouncedSearch.trim());
  const listLoading = isLoading || (isFetching && hasFilters);

  return {
    data,
    isLoading: listLoading,
    isFetching,
    searchInput,
    categoryId,
    page,
    sort,
    order,
    activeSort,
    sortOptions: SORT_OPTIONS,
    hasFilters,
    setCategoryId,
    setSort,
    setPage,
    handleSearchChange,
    clearFilters,
  };
}
