import type { FilterConfig, SortOrder } from "../../types";
import { SearchFilter } from "./SearchFilter";
import { SelectFilter } from "./SelectFilter";
import { SortButton } from "./SortButton";

interface TableFiltersProps {
  filters: FilterConfig[];
  search: string;
  onSearchChange: (value: string) => void;
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  sortField: string;
  sortOrder: SortOrder;
  onSort: (field: string) => void;
}

export const TableFilters = ({
  filters,
  search,
  onSearchChange,
  activeFilters,
  onFilterChange,
  sortField,
  sortOrder,
  onSort,
}: TableFiltersProps) => {
  const searchConfig = filters.find((f) => f.type === "search");
  const selectConfigs = filters.filter((f) => f.type === "select");
  const sortConfig = filters.find((f) => f.type === "sort");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {searchConfig && searchConfig.type === "search" && (
        <SearchFilter
          value={search}
          onChange={onSearchChange}
          placeholder={searchConfig.placeholder}
        />
      )}

      {selectConfigs.map(
        (cfg) =>
          cfg.type === "select" && (
            <SelectFilter
              key={cfg.paramKey}
              label={cfg.label}
              value={activeFilters[cfg.paramKey] ?? ""}
              options={cfg.options}
              onChange={(v) => onFilterChange(cfg.paramKey, v)}
            />
          ),
      )}

      {sortConfig && sortConfig.type === "sort" && (
        <SortButton
          options={sortConfig.options}
          activeField={sortField}
          activeOrder={sortOrder}
          onSort={onSort}
        />
      )}
    </div>
  );
};
