import { MdArrowUpward, MdArrowDownward, MdUnfoldMore } from "react-icons/md";
import type { SortOrder, SortOption } from "../../types";

interface SortButtonProps {
  options: SortOption[];
  activeField: string;
  activeOrder: SortOrder;
  onSort: (field: string) => void;
}

export const SortButton = ({
  options,
  activeField,
  activeOrder,
  onSort,
}: SortButtonProps) => {
  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => {
        const isActive = activeField === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSort(opt.value)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              isActive
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {opt.label}
            {isActive ? (
              activeOrder === "asc" ? (
                <MdArrowUpward size={14} />
              ) : (
                <MdArrowDownward size={14} />
              )
            ) : (
              <MdUnfoldMore size={14} className="text-gray-300" />
            )}
          </button>
        );
      })}
    </div>
  );
};
