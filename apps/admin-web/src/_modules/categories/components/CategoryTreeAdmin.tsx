import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { MdAdd, MdDeleteOutline, MdEdit } from "react-icons/md";
import type { ICategory } from "../types";

interface CategoryTreeAdminProps {
  categories: ICategory[];
  onAddChild: (parent: ICategory | null) => void;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
}

function CategoryTreeNode({
  category,
  depth,
  onAddChild,
  onEdit,
  onDelete,
}: {
  category: ICategory;
  depth: number;
  onAddChild: (parent: ICategory | null) => void;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = category.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-5" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
          <p className="text-xs text-gray-400 truncate">{category.slug}</p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            style="ghost"
            className="!px-2 !py-1 !text-xs"
            icon={<MdAdd size={14} />}
            onClick={() => onAddChild(category)}
          >
            {t("categories.addChild")}
          </Button>
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
          >
            <MdEdit size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <MdDeleteOutline size={16} />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTreeAdmin({
  categories,
  onAddChild,
  onEdit,
  onDelete,
}: CategoryTreeAdminProps) {
  return (
    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
      {categories.map((category) => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          depth={0}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
