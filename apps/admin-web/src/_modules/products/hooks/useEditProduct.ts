import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePut } from "@/_shared/queryProvider";
import { useModal, useToast } from "@mercado/shared-ui";
import { getProduct, getProducts, getProductVariants, updateProduct, getAttributesByShop } from "../api";
import { getCategories } from "@/_modules/categories/api";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import { isProductImageUrlValid } from "../components/ProductImageField";
import type {
  IProductDetailResponse,
  IRawVariant,
  IEditableVariant,
  IVariantAttributeSelection,
  IProductAttribute,
} from "../types";
import type { ICategory } from "@/_modules/categories/types";
import { AddAttributeModal } from "@/_modules/attributes/components";
import { findDuplicateVariants, rawVariantToEditable } from "../utils";

export function useEditProduct(id: string) {
  const navigate = useNavigate();
  const { shopId, paths } = useShop();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { openModal, ModalRenderer, closeModal } = useModal({});

  const { data: product, isLoading: productLoading } = useFetch<IProductDetailResponse>({
    queryKey: getProduct.queryKey(id),
    url: getProduct.url(id),
  });

  const { data: rawVariants, isLoading: variantsLoading } = useFetch<IRawVariant[]>({
    queryKey: getProductVariants.queryKey(id),
    url: getProductVariants.url(id),
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [variants, setVariants] = useState<IEditableVariant[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [originalVariantIds, setOriginalVariantIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newVarName, setNewVarName] = useState("");
  const [newVarPrice, setNewVarPrice] = useState("");
  const [newVarStock, setNewVarStock] = useState("");
  const [newSelections, setNewSelections] = useState<
    Record<string, { valueId: string; valueName: string }>
  >({});

  const attributesShopId = shopId;

  const { data: shopAttributes } = useFetch<IProductAttribute[]>({
    queryKey: getAttributesByShop.queryKey(attributesShopId),
    url: getAttributesByShop.url(attributesShopId),
    enabled: Boolean(attributesShopId),
  });

  const { data: categoryTree } = useFetch<ICategory[]>({
    queryKey: getCategories.queryKey,
    url: getCategories.url,
  });

  useEffect(() => {
    if (!product || !rawVariants || initialized) return;
    setName(product.name);
    setDescription(product.description ?? "");
    setImageUrl(product.imageUrl ?? "");
    setIsActive(product.isActive);
    setCategoryIds(product.categories.map((c) => c.id));
    setCategoryNames(Object.fromEntries(product.categories.map((c) => [c.id, c.name])));
    const editables = rawVariants.map(rawVariantToEditable);
    setVariants(editables);
    setOriginalVariantIds(new Set(rawVariants.map((v) => v.id)));
    setInitialized(true);
  }, [product, rawVariants, initialized]);

  const { mutate: putProduct, isPending } = usePut();

  const handleToggleCategory = (catId: string, catName: string, path: string) => {
    setCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
    setCategoryNames((prev) => {
      const next = { ...prev };
      if (next[catId]) delete next[catId];
      else next[catId] = path || catName;
      return next;
    });
  };

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

        const existingForAttr = v.attributeSelections.find((s) => s.attributeId === attrId);

        let nextSelections: IVariantAttributeSelection[];
        let nextValueIds: string[];

        if (existingForAttr?.valueId === valueId) {
          nextSelections = v.attributeSelections.filter((s) => s.attributeId !== attrId);
          nextValueIds = v.attributeValueIds.filter((vid) => vid !== valueId);
        } else {
          nextSelections = [
            ...v.attributeSelections.filter((s) => s.attributeId !== attrId),
            { attributeId: attrId, attributeName: attrName, valueId, valueName },
          ];
          const oldValueId = existingForAttr?.valueId;
          nextValueIds = [...v.attributeValueIds.filter((vid) => vid !== oldValueId), valueId];
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

    const attributeSelections: IVariantAttributeSelection[] = Object.entries(newSelections).map(
      ([attrId, sel]) => {
        const attr = shopAttributes?.find((a) => a.id === attrId);
        return {
          attributeId: attrId,
          attributeName: attr?.name ?? "",
          valueId: sel.valueId,
          valueName: sel.valueName,
        };
      }
    );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("products.infoStep.nameRequired"));
      return;
    }
    if (imageUrl.trim() && !isProductImageUrlValid(imageUrl)) {
      setError(t("products.infoStep.imageUrlInvalid"));
      return;
    }
    if (variants.length === 0) {
      setError(t("products.variantsStep.addAtLeastOne"));
      return;
    }

    const missingAttrs = variants.some((v) => v.attributeValueIds.length === 0);
    if (missingAttrs) {
      setError(t("products.editProduct_variantNeedsAttribute"));
      return;
    }

    const dupes = findDuplicateVariants(variants);
    if (dupes.size > 0) {
      setError(t("products.editProduct_variantDuplicate"));
      return;
    }

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

    putProduct(
      {
        url: updateProduct.url(id),
        data: {
          name: name.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          shopId,
          isActive,
          categoryIds,
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
          queryClient.invalidateQueries({ queryKey: getProducts.queryKey(shopId) });
          queryClient.invalidateQueries({ queryKey: getProduct.queryKey(id) });
          queryClient.invalidateQueries({ queryKey: getProductVariants.queryKey(id) });
          navigate(paths.product(id));
        },
      }
    );
  };

  const duplicateTempIds = findDuplicateVariants(variants);

  const openAddAttributeModal = () => {
    if (!attributesShopId || !product) return;
    openModal(AddAttributeModal, {
      onClose: closeModal,
      fixedShopId: attributesShopId,
      fixedShopName: product.shop.name,
    });
  };

  return {
    product,
    isLoading: productLoading || variantsLoading,
    error,
    name,
    setName,
    description,
    setDescription,
    imageUrl,
    setImageUrl,
    isActive,
    setIsActive,
    categoryIds,
    categoryNames,
    categoryTree,
    handleToggleCategory,
    variants,
    duplicateTempIds,
    shopAttributes,
    attributesShopId,
    updateVariantField,
    toggleVariantAttrValue,
    removeVariant,
    showNewForm,
    setShowNewForm,
    newVarName,
    setNewVarName,
    newVarPrice,
    setNewVarPrice,
    newVarStock,
    setNewVarStock,
    newSelections,
    setNewSelections,
    resetNewForm,
    handleAddVariant,
    handleSubmit,
    isPending,
    ModalRenderer,
    openAddAttributeModal,
    goBack: () => navigate(paths.product(id)),
    goToProduct: () => navigate(paths.product(id)),
  };
}
