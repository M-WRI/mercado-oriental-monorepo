import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ICategory } from "../types";

function flattenCategories(categories: ICategory[]): ICategory[] {
  const result: ICategory[] = [];
  const walk = (nodes: ICategory[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(categories);
  return result;
}

function getCategoryPath(categories: ICategory[], id: string): string {
  const flat = flattenCategories(categories);
  const byId = new Map(flat.map((c) => [c.id, c]));
  const parts: string[] = [];
  let current = byId.get(id);
  while (current) {
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return parts.join(" › ");
}

export function CategoryPicker({
  categories,
  selectedIds,
  onToggle,
  leafOnly = false,
}: {
  categories: ICategory[];
  selectedIds: string[];
  onToggle: (id: string, name: string, path: string) => void;
  leafOnly?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const flatMatch = (cats: ICategory[], term: string): ICategory[] => {
    const results: ICategory[] = [];
    for (const c of cats) {
      const path = getCategoryPath(categories, c.id);
      if (c.name.toLowerCase().includes(term) || path.toLowerCase().includes(term)) {
        results.push(c);
      }
      if (c.children?.length) results.push(...flatMatch(c.children, term));
    }
    return results;
  };

  const filtered = search.trim()
    ? flatMatch(categories, search.toLowerCase())
    : null;

  const handleSelect = (cat: ICategory) => {
    const path = getCategoryPath(categories, cat.id);
    onToggle(cat.id, cat.name, path);
  };

  const renderTree = (nodes: ICategory[], depth = 0) =>
    nodes.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expanded[cat.id];
      const isSelected = selectedIds.includes(cat.id);
      const isLeaf = !hasChildren;

      return (
        <div key={cat.id}>
          <button
            type="button"
            onClick={() => {
              if (hasChildren && !leafOnly) {
                setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }));
              } else if (isLeaf || !leafOnly) {
                handleSelect(cat);
              } else {
                setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }));
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-2 ${
              isSelected
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            {hasChildren ? (
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            <span className="truncate">{cat.name}</span>
            {isSelected && (
              <svg className="w-4 h-4 ml-auto text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          {hasChildren && isExpanded && renderTree(cat.children, depth + 1)}
        </div>
      );
    });

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("categories.searchPlaceholder")}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
      />
      <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg py-1">
        {filtered
          ? filtered.length > 0
            ? filtered.map((cat) => {
                const path = getCategoryPath(categories, cat.id);
                const isSelected = selectedIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block truncate">{cat.name}</span>
                    <span className="block text-xs text-gray-400 truncate">{path}</span>
                  </button>
                );
              })
            : <p className="px-3 py-2 text-sm text-gray-400">{t("categories.noResults")}</p>
          : renderTree(categories)}
      </div>
    </div>
  );
}

export function useCategoryPaths(categories: ICategory[] | undefined) {
  return useMemo(() => {
    if (!categories) return new Map<string, string>();
    const map = new Map<string, string>();
    const flat = flattenCategories(categories);
    for (const cat of flat) {
      map.set(cat.id, getCategoryPath(categories, cat.id));
    }
    return map;
  }, [categories]);
}
