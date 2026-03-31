import type { ListFilterConfig, ParsedListQuery } from "./types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const ALLOWED_LIMITS = [10, 20, 50, 100];

function clampLimit(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return ALLOWED_LIMITS.includes(n) ? n : DEFAULT_LIMIT;
}

function clampPage(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_PAGE;
}

/**
 * Turns a nested dot-path (e.g. "shop.name") into a nested Prisma `contains` filter.
 */
function nestedContains(
  path: string,
  value: string,
): Record<string, unknown> {
  const parts = path.split(".");
  if (parts.length === 1) {
    return { [path]: { contains: value, mode: "insensitive" } };
  }
  const [head, ...rest] = parts;
  return { [head]: nestedContains(rest.join("."), value) };
}

/**
 * Parses Express query params according to a module's filter config.
 * Returns Prisma-ready `where`, `orderBy`, `skip`, `take` plus pagination metadata.
 */
export function parseListQuery(
  query: Record<string, unknown>,
  config: ListFilterConfig,
): ParsedListQuery {
  const page = clampPage(query.page);
  const limit = clampLimit(query.limit);

  // --- Search ---
  const searchConditions: Record<string, unknown>[] = [];
  const search = typeof query.search === "string" ? query.search.trim() : "";
  if (search && config.searchFields.length > 0) {
    for (const field of config.searchFields) {
      searchConditions.push(nestedContains(field, search));
    }
  }

  // --- Select filters ---
  const selectConditions: Record<string, unknown> = {};
  for (const [paramKey, def] of Object.entries(config.selectFilters)) {
    const raw = query[paramKey];
    if (typeof raw !== "string" || !raw) continue;
    if (def.allowedValues && !def.allowedValues.includes(raw)) continue;
    selectConditions[def.prismaField] = raw;
  }

  // --- Sort ---
  const sortField =
    typeof query.sort === "string" && config.sortableFields.includes(query.sort)
      ? query.sort
      : config.defaultSort.field;
  const sortOrder =
    typeof query.order === "string" && ["asc", "desc"].includes(query.order)
      ? query.order
      : config.defaultSort.order;

  // --- Compose ---
  const where: Record<string, unknown> = {
    ...selectConditions,
    ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
  };

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
    where,
    orderBy: { [sortField]: sortOrder },
  };
}
