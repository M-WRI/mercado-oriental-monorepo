import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePatch } from "@/_shared/queryProvider";
import { Button, useToast } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { TextArea } from "@mercado/shared-ui/components/inputs/components/TextArea";
import { getShops } from "@/_modules/shops/api";
import { getProduct, getProducts, getProductVariants, updateProduct, getAttributesByShop } from "../../api";
import type {
  IProductDetailResponse,
  IShop,
  IRawVariant,
  IEditableVariant,
  IVariantAttributeSelection,
  IProductAttribute,
} from "../../types";
import { MdAdd, MdClose } from "react-icons/md";
import { useModal } from "@mercado/shared-ui";
import { AddAttributeModal } from "@/_modules/attributes/components";

// ── Helpers ────────────────────────────────────────────────────────

function rawVariantToEditable(v: IRawVariant): IEditableVariant {
  return {
    id: v.id,
    tempId: v.id,
    name: v.name,
    price: v.price,
    stock: v.stock,
    attributeValueIds: v.productVariantAttributeValues.map(
      (link) => link.productAttributeValueId
    ),
    attributeSelections: v.productVariantAttributeValues.map((link) => ({
      attributeId: link.productAttributeValue.productAttribute.id,
      attributeName: link.productAttributeValue.productAttribute.name,
      valueId: link.productAttributeValueId,
      valueName: link.productAttributeValue.value,
    })),
  };
}

function getAttributeValueKey(variant: IEditableVariant): string {
  return [...variant.attributeValueIds].sort().join(",");
}

function findDuplicateVariants(variants: IEditableVariant[]): Set<string> {
  const seen = new Map<string, string>();
  const duplicates = new Set<string>();
  for (const v of variants) {
    if (v.attributeValueIds.length === 0) continue;
    const key = getAttributeValueKey(v);
    const existing = seen.get(key);
    if (existing) {
      duplicates.add(existing);
      duplicates.add(v.tempId);
    } else {
      seen.set(key, v.tempId);
    }
  }
  return duplicates;
}

// ── Main component ─────────────────────────────────────────────────

const EditProductForm = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  // Fetch product
  const { data: product, isLoading: productLoading } = useFetch<IProductDetailResponse>({
    queryKey: getProduct.queryKey(id),
    url: getProduct.url(id),
  });

  // Fetch raw variants (with attribute value IDs)
  const { data: rawVariants, isLoading: variantsLoading } = useFetch<IRawVariant[]>({
    queryKey: getProductVariants.queryKey(id),
    url: getProductVariants.url(id),
  });

  // Fetch shops
  const { data: shops } = useFetch<IShop[]>({
    queryKey: getShops.queryKey,
    url: getShops.url,
  });

  // Product fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shopId, setShopId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Variant state
  const [variants, setVariants] = useState<IEditableVariant[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [originalVariantIds, setOriginalVariantIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // New variant form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newVarName, setNewVarName] = useState("");
  const [newVarPrice, setNewVarPrice] = useState("");
  const [newVarStock, setNewVarStock] = useState("");
  const [newSelections, setNewSelections] = useState<
    Record<string, { valueId: string; valueName: string }>
  >({});

  // Shop for attributes: use form state once seeded, or product.shop while product is loading first paint
  const attributesShopId = shopId || product?.shop.id || "";

  // Fetch shop attributes only when we have a real shop id (never use a placeholder — backend returns 403)
  const { data: shopAttributes } = useFetch<IProductAttribute[]>({
    queryKey: getAttributesByShop.queryKey(attributesShopId),
    url: getAttributesByShop.url(attributesShopId),
    enabled: Boolean(attributesShopId),
  });

  // Seed form when data arrives
  useEffect(() => {
    if (!product || !rawVariants || initialized) return;
    setName(product.name);
    setDescription(product.description ?? "");
    setShopId(product.shop.id);
    setIsActive(product.isActive);
    const editables = rawVariants.map(rawVariantToEditable);
    setVariants(editables);
    setOriginalVariantIds(new Set(rawVariants.map((v) => v.id)));
    setInitialized(true);
  }, [product, rawVariants, initialized]);

  const { mutate: patchProduct, isPending } = usePatch();
  const { openModal, ModalRenderer, closeModal } = useModal({});

  // ── Inline variant editing ────────────────────────────────────────

  const updateVariantField = (
    tempId: string,
    field: "name" | "price" | "stock",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.tempId !== tempId) return v;
        if (field === "name") return { ...v, name: value };
        if (field === "price") return { ...v, price: parseFloat(value) || 0 };
        return { ...v, stock: parseInt(value, 10) || 0 };
      })
    );
  };

  const toggleVariantAttrValue = (
    tempId: string,
    attrId: string,
    attrName: string,
    valueId: string,
    valueName: string
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.tempId !== tempId) return v;

        const existingForAttr = v.attributeSelections.find(
          (s) => s.attributeId === attrId
        );

        let nextSelections: IVariantAttributeSelection[];
        let nextValueIds: string[];

        if (existingForAttr?.valueId === valueId) {
          // Deselect
          nextSelections = v.attributeSelections.filter(
            (s) => s.attributeId !== attrId
          );
          nextValueIds = v.attributeValueIds.filter((id) => id !== valueId);
        } else {
          // Select (replace any existing selection for this attribute)
          nextSelections = [
            ...v.attributeSelections.filter((s) => s.attributeId !== attrId),
            { attributeId: attrId, attributeName: attrName, valueId, valueName },
          ];
          const oldValueId = existingForAttr?.valueId;
          nextValueIds = [
            ...v.attributeValueIds.filter((id) => id !== oldValueId),
            valueId,
          ];
        }

        return { ...v, attributeSelections: nextSelections, attributeValueIds: nextValueIds };
      })
    );
  };

  const removeVariant = (tempId: string) => {
    const v = variants.find((x) => x.tempId === tempId);
    if (v?.id && originalVariantIds.has(v.id)) {
      setDeletedVariantIds((prev) => [...prev, v.id!]);
    }
    setVariants((prev) => prev.filter((x) => x.tempId !== tempId));
  };

  // ── New variant form ──────────────────────────────────────────────

  const resetNewForm = () => {
    setNewVarName("");
    setNewVarPrice("");
    setNewVarStock("");
    setNewSelections({});
    setShowNewForm(false);
  };

  const handleAddVariant = () => {
    if (!newVarName.trim()) return;
    const price = parseFloat(newVarPrice);
    const stock = parseInt(newVarStock, 10);
    if (isNaN(price) || price < 0) return;

    const attributeSelections: IVariantAttributeSelection[] = Object.entries(
      newSelections
    ).map(([attrId, sel]) => {
      const attr = shopAttributes?.find((a) => a.id === attrId);
      return {
        attributeId: attrId,
        attributeName: attr?.name ?? "",
        valueId: sel.valueId,
        valueName: sel.valueName,
      };
    });

    const attributeValueIds = attributeSelections.map((s) => s.valueId);

    const variant: IEditableVariant = {
      tempId: `new-${Date.now()}`,
      name: newVarName.trim(),
      price,
      stock: isNaN(stock) ? 0 : stock,
      attributeValueIds,
      attributeSelections,
    };

    setVariants((prev) => [...prev, variant]);
    resetNewForm();
  };

  // ── Submit ────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("products.infoStep.nameRequired"));
      return;
    }
    if (!shopId) {
      setError(t("products.infoStep.shopRequired"));
      return;
    }
    if (variants.length === 0) {
      setError(t("products.variantsStep.addAtLeastOne"));
      return;
    }

    // Validate every variant has at least one attribute value
    const missingAttrs = variants.some((v) => v.attributeValueIds.length === 0);
    if (missingAttrs) {
      setError(t("products.editProduct_variantNeedsAttribute"));
      return;
    }

    // Check for duplicate attribute-value combinations
    const dupes = findDuplicateVariants(variants);
    if (dupes.size > 0) {
      setError(t("products.editProduct_variantDuplicate"));
      return;
    }

    // Build payload diff
    const toCreate = variants
      .filter((v) => !v.id)
      .map((v) => ({
        name: v.name,
        price: v.price,
        stock: v.stock,
        attributeValueIds: v.attributeValueIds,
      }));

    const toUpdate = variants
      .filter((v) => v.id && originalVariantIds.has(v.id))
      .map((v) => ({
        id: v.id!,
        name: v.name,
        price: v.price,
        stock: v.stock,
        attributeValueIds: v.attributeValueIds,
      }));

    patchProduct(
      {
        url: updateProduct.url(id),
        data: {
          name: name.trim(),
          description: description.trim() || null,
          shopId,
          isActive,
          variants: {
            create: toCreate.length > 0 ? toCreate : undefined,
            update: toUpdate.length > 0 ? toUpdate : undefined,
            delete: deletedVariantIds.length > 0 ? deletedVariantIds : undefined,
          },
        },
      },
      {
        onSuccess: () => {
          toastSuccess(t("success.product_updated"));
          queryClient.invalidateQueries({ queryKey: getProducts.queryKey });
          queryClient.invalidateQueries({ queryKey: getProduct.queryKey(id) });
          queryClient.invalidateQueries({ queryKey: getProductVariants.queryKey(id) });
          navigate(`/products/${id}`);
        },
      }
    );
  };

  // ── Loading / not found ───────────────────────────────────────────

  if (productLoading || variantsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("products.notFound")}</p>
      </div>
    );
  }

  const duplicateTempIds = findDuplicateVariants(variants);

  // ── Render ────────────────────────────────────────────────────────

  return (
    <>
      {ModalRenderer}
      <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      <div className="shrink-0 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Button onClick={() => navigate(`/products/${id}`)} style="link" className="!text-xs !p-0">
            {product.name}
          </Button>
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs text-gray-400">{t("products.editProduct")}</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900">{t("products.editProduct")}</h4>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {/* ── Product info ──────────────────────────────────────── */}
        <div className="max-w-lg grid gap-5 mb-8">
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

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {t("products.activeStatus")}
            </label>
            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`flex items-center gap-2 w-fit px-3 py-2 rounded-lg border text-sm transition-colors duration-150 ${
                isActive
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-gray-300 bg-gray-50 text-gray-500"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
              {isActive ? t("products.active") : t("products.inactive")}
            </button>
            <p className="text-xs text-gray-400">{t("products.activeStatusHint")}</p>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {t("products.infoStep.shopLabel")}
            </label>
            {shops && shops.length > 0 ? (
              <div className="grid gap-2">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => setShopId(shop.id)}
                    className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors duration-150 ${
                      shopId === shop.id
                        ? "border-gray-900 bg-gray-50 text-gray-900"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium">{shop.name}</span>
                    {shop.description && (
                      <span className="block text-xs text-gray-400 mt-0.5">
                        {shop.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t("products.infoStep.noShops")}</p>
            )}
          </div>
        </div>

        {/* ── Variants ──────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h5 className="text-sm font-medium text-gray-700">
              {t("products.variants")} ({variants.length})
            </h5>
            <Button
              type="button"
              style="primaryOutline"
              icon={<MdAdd size={16} />}
              onClick={() => {
                if (!attributesShopId) return;
                openModal(AddAttributeModal, {
                  onClose: closeModal,
                  fixedShopId: attributesShopId,
                  fixedShopName: product.shop.name,
                });
              }}
            >
              {t("products.editProduct_createNewAttribute")}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-4 max-w-2xl">
            {t("products.editProduct_createNewAttributeHint")}
          </p>

          {variants.length > 0 && (
            <div className="grid gap-3 mb-4">
              {variants.map((v) => {
                const isDuplicate = duplicateTempIds.has(v.tempId);
                return (
                  <div
                    key={v.tempId}
                    className={`border rounded-lg p-4 ${
                      isDuplicate ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <Input
                            name={`var-name-${v.tempId}`}
                            label={t("products.variantsStep.nameLabel")}
                            value={v.name}
                            onChange={(e) =>
                              updateVariantField(v.tempId, "name", e.target.value)
                            }
                          />
                          <Input
                            name={`var-price-${v.tempId}`}
                            label={t("products.variantsStep.priceLabel")}
                            type="number"
                            value={v.price}
                            onChange={(e) =>
                              updateVariantField(v.tempId, "price", e.target.value)
                            }
                          />
                          <Input
                            name={`var-stock-${v.tempId}`}
                            label={t("products.variantsStep.stockLabel")}
                            type="number"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariantField(v.tempId, "stock", e.target.value)
                            }
                          />
                        </div>

                        {/* Attribute value selection */}
                        {shopAttributes && shopAttributes.length > 0 && (
                          <div className="grid gap-2">
                            {shopAttributes.map((attr) => {
                              const selected = v.attributeSelections.find(
                                (s) => s.attributeId === attr.id
                              );
                              return (
                                <div key={attr.id}>
                                  <span className="text-xs font-medium text-gray-500">
                                    {attr.name}
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {attr.productAttributeValues.map((av) => {
                                      const isSelected = selected?.valueId === av.id;
                                      return (
                                        <button
                                          key={av.id}
                                          type="button"
                                          onClick={() =>
                                            toggleVariantAttrValue(
                                              v.tempId,
                                              attr.id,
                                              attr.name,
                                              av.id,
                                              av.value
                                            )
                                          }
                                          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                                            isSelected
                                              ? "border-gray-900 bg-gray-900 text-white"
                                              : "border-gray-200 text-gray-600 hover:border-gray-400"
                                          }`}
                                        >
                                          {av.value}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isDuplicate && (
                          <p className="text-xs text-red-500 mt-2">
                            {t("products.editProduct_variantDuplicate")}
                          </p>
                        )}
                        {v.attributeValueIds.length === 0 && (
                          <p className="text-xs text-red-500 mt-2">
                            {t("products.editProduct_variantNeedsAttribute")}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => removeVariant(v.tempId)}
                        style="ghost"
                        icon={<MdClose size={18} />}
                        className="shrink-0 mt-0.5"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new variant form */}
          {showNewForm ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-4">
                {t("products.variantsStep.newVariant")}
              </h5>
              <div className="grid gap-4">
                <Input
                  name="newVarName"
                  label={t("products.variantsStep.nameLabel")}
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder={t("products.variantsStep.namePlaceholder")}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="newVarPrice"
                    label={t("products.variantsStep.priceLabel")}
                    type="number"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(e.target.value)}
                    placeholder={t("products.variantsStep.pricePlaceholder")}
                  />
                  <Input
                    name="newVarStock"
                    label={t("products.variantsStep.stockLabel")}
                    type="number"
                    value={newVarStock}
                    onChange={(e) => setNewVarStock(e.target.value)}
                    placeholder={t("products.variantsStep.stockPlaceholder")}
                  />
                </div>

                {shopAttributes && shopAttributes.length > 0 && (
                  <div className="grid gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      {t("products.variantsStep.attributeValues")}
                    </label>
                    {shopAttributes.map((attr) => (
                      <div key={attr.id}>
                        <span className="text-sm text-gray-700 font-medium">
                          {attr.name}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {attr.productAttributeValues.map((av) => {
                            const isSelected =
                              newSelections[attr.id]?.valueId === av.id;
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() =>
                                  setNewSelections((prev) => ({
                                    ...prev,
                                    [attr.id]: {
                                      valueId: av.id,
                                      valueName: av.value,
                                    },
                                  }))
                                }
                                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                                  isSelected
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                                }`}
                              >
                                {av.value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <Button style="link" onClick={resetNewForm}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleAddVariant}
                    disabled={!newVarName.trim() || !newVarPrice}
                  >
                    {t("products.variantsStep.addVariant")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowNewForm(true)}
              style="dashed"
              icon={<MdAdd size={18} />}
            >
              {t("products.variantsStep.addVariant")}
            </Button>
          )}
        </div>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("common.submitting") : t("common.save")}
          </Button>
          <Button
            type="button"
            style="ghost"
            onClick={() => navigate(`/products/${id}`)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </form>
      </div>
    </>
  );
};

export const EditProduct = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("products.notFound")}</p>
      </div>
    );
  }

  return <EditProductForm id={id} />;
};
