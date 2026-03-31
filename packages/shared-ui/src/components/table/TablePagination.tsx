import { useTranslation } from "react-i18next";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const TablePagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) => {
  const { t } = useTranslation();
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm text-gray-500">
      {/* Left: rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{t("filters.rowsPerPage")}</span>
        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSizeChange(size)}
              className={`px-2 py-1 text-xs font-medium transition-colors ${
                limit === size
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Right: page info + nav */}
      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums">
          {t("filters.pageInfo", { from, to, total })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronLeft size={18} />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
