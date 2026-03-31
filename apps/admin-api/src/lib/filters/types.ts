export interface ListFilterConfig {
  /** Fields to search with `contains` (OR across all). Supports dot-notation for relations. */
  searchFields: string[];
  /** Field names the client is allowed to sort by. */
  sortableFields: string[];
  /** Default sort when the client does not specify one. */
  defaultSort: { field: string; order: "asc" | "desc" };
  /** Discrete-value (select) filters the client can pass as query params. */
  selectFilters: Record<
    string,
    { prismaField: string; allowedValues?: string[] }
  >;
}

export interface ParsedListQuery {
  skip: number;
  take: number;
  page: number;
  limit: number;
  where: Record<string, unknown>;
  orderBy: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
