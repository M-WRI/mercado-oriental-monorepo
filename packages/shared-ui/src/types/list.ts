/** Envelope returned by every paginated list endpoint. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type SortOrder = "asc" | "desc";

export interface ListQueryParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
  order: SortOrder;
  filters: Record<string, string>;
}

// ─── Filter config (drives the UI) ───────────────────────────────

export interface SearchFilterConfig {
  type: "search";
  /** Query-param key sent to the API (usually "search"). */
  paramKey?: string;
  placeholder?: string;
}

export interface SelectFilterConfig {
  type: "select";
  /** Query-param key sent to the API (e.g. "status", "isActive"). */
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface SortOption {
  /** The field key sent to the API (e.g. "createdAt"). */
  value: string;
  label: string;
}

export interface SortFilterConfig {
  type: "sort";
  options: SortOption[];
}

export type FilterConfig =
  | SearchFilterConfig
  | SelectFilterConfig
  | SortFilterConfig;
