import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { useFetch } from "@/_shared/queryProvider";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { TextArea } from "@mercado/shared-ui/components/inputs/components/TextArea";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import { ProductImageField, isProductImageUrlValid } from "../../../components/ProductImageField";
import { getCategories } from "../../../api";
import type { ICategory } from "@/_modules/products/types";

function CategoryPicker({
  categories,
  selectedIds,
  onToggle,
}: {
  categories: ICategory[];
  selectedIds: string[];
  onToggle: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const flatMatch = (cats: ICategory[], term: string): ICategory[] => {
    const results: ICategory[] = [];
    for (const c of cats) {
      if (c.name.toLowerCase().includes(term)) results.push(c);
      if (c.children?.length) results.push(...flatMatch(c.children, term));
    }
    return results;
  };

  const filtered = search.trim()
    ? flatMatch(categories, search.toLowerCase())
    : null;

  const renderTree = (nodes: ICategory[], depth = 0) =>
    nodes.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expanded[cat.id];
      const isSelected = selectedIds.includes(cat.id);

      return (
        <div key={cat.id}>
          <button
            type="button"
            onClick={() => {
              if (hasChildren) {
                setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }));
              } else {
                onToggle(cat.id, cat.name);
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-2 ${
              isSelected
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            {hasChildren && (
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {!hasChildren && <span className="w-3.5" />}
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
        placeholder="Search categories…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
      />
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg py-1">
        {filtered
          ? filtered.length > 0
            ? filtered.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggle(cat.id, cat.name)}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                    selectedIds.includes(cat.id)
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))
            : <p className="px-3 py-2 text-sm text-gray-400">No categories found</p>
          : renderTree(categories)}
      </div>
    </div>
  );
}

export const ProductInfoStep = ({ data, submitRef, onComplete }: StepProps) => {
  const { t } = useTranslation();
  const { shopId, shop } = useShop();
  const prevData = data.productInfo;
  const [name, setName] = useState(prevData?.name ?? "");
  const [description, setDescription] = useState(prevData?.description ?? "");
  const [imageUrl, setImageUrl] = useState(prevData?.imageUrl ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(prevData?.categoryIds ?? []);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(prevData?._categoryNames ?? {});
  const [error, setError] = useState<string | null>(null);

  const { data: categoryTree } = useFetch<ICategory[]>({
    queryKey: getCategories.queryKey,
    url: getCategories.url,
  });

  useEffect(() => {
    submitRef.current = () => {
      setError(null);
      if (!name.trim()) {
        setError(t("products.infoStep.nameRequired"));
        return;
      }
      if (imageUrl.trim() && !isProductImageUrlValid(imageUrl)) {
        setError(t("products.infoStep.imageUrlInvalid"));
        return;
      }
      onComplete({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        shopId,
        shopName: shop.name,
        categoryIds,
        _categoryNames: categoryNames,
      });
    };
  }, [name, description, imageUrl, shopId, shop.name, categoryIds, categoryNames, submitRef, onComplete, t]);

  const handleToggleCategory = (id: string, catName: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setCategoryNames((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = catName;
      return next;
    });
  };

  return (
    <div className="max-w-lg">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        <Input
          name="name"
          label={t("products.infoStep.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("products.infoStep.namePlaceholder")}
        />

        <TextArea
          name="description"
          label={t("products.infoStep.descriptionLabel")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("products.infoStep.descriptionPlaceholder")}
          rows={3}
        />

        <ProductImageField value={imageUrl} onChange={setImageUrl} />

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-gray-700">{t("products.infoStep.shopLabel")}</label>
          <p className="text-sm text-gray-600 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
            {shop.name}
          </p>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-gray-700">Categories</label>
          {categoryIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {categoryIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
                >
                  {categoryNames[id] || id}
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(id, categoryNames[id] || "")}
                    className="hover:text-indigo-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {categoryTree ? (
            <CategoryPicker
              categories={categoryTree}
              selectedIds={categoryIds}
              onToggle={handleToggleCategory}
            />
          ) : (
            <p className="text-sm text-gray-400">Loading categories…</p>
          )}
        </div>
      </div>
    </div>
  );
};
