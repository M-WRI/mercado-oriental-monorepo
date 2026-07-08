import { useMemo } from "react";
import { useFetch } from "@mercado/shared-ui";
import { categoriesEndpoint } from "../api";
import { flattenCategories } from "../utils/flattenCategories";
import type { Category, FlatCategory } from "../types";

interface CategoryFilterProps {
  selectedId: string;
  onSelect: (id: string | null) => void;
  variant?: "sidebar" | "chips";
}

function getChipCategories(
  selectedId: string,
  selectedCategory: FlatCategory | undefined,
  flatCategories: FlatCategory[],
): FlatCategory[] {
  if (!selectedId || !selectedCategory) {
    return flatCategories.filter((c) => c.depth === 0);
  }

  const children = flatCategories.filter((c) => c.parentId === selectedId);
  if (children.length > 0) {
    return children;
  }

  if (selectedCategory.parentId) {
    return flatCategories.filter((c) => c.parentId === selectedCategory.parentId);
  }

  return flatCategories.filter((c) => c.depth === 0);
}

function isDescendantOf(
  flatCategories: FlatCategory[],
  ancestorId: string,
  candidateId: string,
): boolean {
  let current = flatCategories.find((c) => c.id === candidateId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = flatCategories.find((c) => c.id === current!.parentId);
  }
  return false;
}

function CategoryTree({
  categories,
  selectedId,
  onSelect,
  flatCategories,
  depth = 0,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string | null) => void;
  flatCategories: FlatCategory[];
  depth?: number;
}) {
  return (
    <ul className={depth === 0 ? "space-y-0.5" : "ml-3 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2"}>
      {categories.map((cat) => {
        const isActive = selectedId === cat.id;
        const isAncestor = selectedId ? isDescendantOf(flatCategories, cat.id, selectedId) : false;

        return (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors truncate ${
                isActive
                  ? "bg-gray-900 text-white font-semibold"
                  : isAncestor
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {cat.name}
            </button>
            {cat.children.length > 0 && (
              <CategoryTree
                categories={cat.children}
                selectedId={selectedId}
                onSelect={onSelect}
                flatCategories={flatCategories}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryFilter({ selectedId, onSelect, variant = "chips" }: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useFetch<Category[]>({
    queryKey: categoriesEndpoint.queryKey,
    url: categoriesEndpoint.url,
  });

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  if (isLoading) {
    if (variant === "sidebar") {
      return (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-7 rounded-lg" />
          ))}
        </div>
      );
    }
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-20 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  const selectedCategory = flatCategories.find((c) => c.id === selectedId);
  const chipCategories = getChipCategories(selectedId, selectedCategory, flatCategories);

  if (variant === "sidebar") {
    return (
      <div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`w-full text-left text-sm px-2 py-1.5 rounded-lg mb-1 transition-colors ${
            !selectedId
              ? "bg-gray-900 text-white font-semibold"
              : "text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          All categories
        </button>
        <CategoryTree
          categories={categories}
          selectedId={selectedId}
          onSelect={onSelect}
          flatCategories={flatCategories}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-5 py-2 text-sm font-medium rounded-full shrink-0 transition-colors ${
          !selectedId
            ? "bg-gray-900 text-white shadow-sm"
            : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        All
      </button>

      {selectedCategory?.parentId && (
        <button
          type="button"
          onClick={() => onSelect(selectedCategory.parentId!)}
          className="px-4 py-2 text-sm font-medium rounded-full shrink-0 bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
        >
          ← Back
        </button>
      )}

      {chipCategories.map((cat) => {
        const isActive = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`px-5 py-2 text-sm font-medium rounded-full shrink-0 transition-colors ${
              isActive
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
