import type { ColumnDef } from "@tanstack/react-table";
import type { FilterConfig, SortOrder } from "@mercado/shared-ui";
import { Table, TableFilters, TablePagination } from "@mercado/shared-ui";
import { useTranslation } from "react-i18next";

interface DefaultListLayoutProps<T> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode | React.ReactNode[];
  tableData: T[];
  tableColumns: ColumnDef<T>[];
  isMultiSelect?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  getRowId?: (row: T) => string;
  bulkActions?: React.ReactNode;
  selectedCount?: number;
  filterConfigs?: FilterConfig[];
  search?: string;
  onSearchChange?: (value: string) => void;
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  sortField?: string;
  sortOrder?: SortOrder;
  onSort?: (field: string) => void;
  page?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const DefaultListLayout = <T extends Record<string, any>>({
  title,
  subtitle,
  actions,
  tableData,
  tableColumns,
  isMultiSelect,
  onSelectionChange,
  getRowId,
  bulkActions,
  selectedCount = 0,
  filterConfigs,
  search = "",
  onSearchChange,
  activeFilters = {},
  onFilterChange,
  sortField = "",
  sortOrder = "desc",
  onSort,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onPageSizeChange,
}: DefaultListLayoutProps<T>) => {
  const { t } = useTranslation();

  const hasFilters = filterConfigs && filterConfigs.length > 0 && onSearchChange && onFilterChange && onSort;
  const hasPagination = page !== undefined && totalPages !== undefined && total !== undefined && limit !== undefined && onPageChange && onPageSizeChange;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-2">{actions && Array.isArray(actions) ? actions.map((action) => action) : actions}</div>
      </div>

      {hasFilters && (
        <div className="shrink-0 mb-4">
          <TableFilters
            filters={filterConfigs}
            search={search}
            onSearchChange={onSearchChange}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={onSort}
          />
        </div>
      )}

      {selectedCount > 0 && bulkActions && (
        <div className="shrink-0 flex items-center gap-3 mb-3 px-4 py-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
          <span className="text-sm font-medium text-indigo-700">{t("common.selected", { count: selectedCount })}</span>
          <div className="h-4 w-px bg-indigo-200" />
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto">
        <Table data={tableData || []} columns={tableColumns} isMultiSelect={isMultiSelect} onSelectionChange={onSelectionChange} getRowId={getRowId} />
      </div>

      {hasPagination && (
        <div className="shrink-0">
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
};
