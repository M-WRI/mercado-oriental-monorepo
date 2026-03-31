import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ListQueryParams, PaginatedResponse, SortOrder, TQueryKey } from "../types";
import { apiGet } from "./client";

const DEFAULT_LIMIT = 10;

interface UseListQueryOptions {
  queryKey: TQueryKey;
  url: string;
  defaultSort?: { field: string; order: SortOrder };
  defaultLimit?: number;
  staticFilters?: Record<string, string>;
  enabled?: boolean;
}

function buildUrl(base: string, params: ListQueryParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  for (const [k, v] of Object.entries(params.filters)) {
    if (v) qs.set(k, v);
  }
  return `${base}?${qs.toString()}`;
}

export function useListQuery<T>({
  queryKey,
  url,
  defaultSort = { field: "createdAt", order: "desc" },
  defaultLimit = DEFAULT_LIMIT,
  staticFilters = {},
  enabled = true,
}: UseListQueryOptions) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [search, setSearchRaw] = useState("");
  const [sort, setSort] = useState(defaultSort.field);
  const [order, setOrder] = useState<SortOrder>(defaultSort.order);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const params: ListQueryParams = useMemo(
    () => ({
      page,
      limit,
      search,
      sort,
      order,
      filters: { ...staticFilters, ...filters },
    }),
    [page, limit, search, sort, order, filters, staticFilters]
  );

  const fullUrl = useMemo(() => buildUrl(url, params), [url, params]);
  const compositeKey: TQueryKey = useMemo(() => [[...queryKey[0], JSON.stringify(params)]], [queryKey, params]);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse<T>>({
    queryKey: compositeKey,
    queryFn: () => apiGet<PaginatedResponse<T>>(fullUrl),
    enabled,
  });

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  }, []);

  const setSorting = useCallback(
    (field: string) => {
      if (field === sort) {
        setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSort(field);
        setOrder("desc");
      }
      setPage(1);
    },
    [sort]
  );

  const setPageSize = useCallback((size: number) => {
    setLimit(size);
    setPage(1);
  }, []);

  return {
    data: data?.data ?? [],
    meta: data?.meta ?? { page: 1, limit: defaultLimit, total: 0, totalPages: 1 },
    isLoading,
    isError,
    refetch,
    params,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    setSorting,
  };
}
