import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { useFormHook } from "@mercado/shared-ui";
import type { IWizardVariant, IVariantAttributeSelection, IProductImageDraft } from "../types";
import { getAvailableAttributes } from "../utils";

export type WizardVariantFormValues = {
  name: string;
  price: string;
  stock: string;
};

export function useProductVariantsStep({ data, submitRef, onComplete }: StepProps) {
  const { t } = useTranslation();
  const prevData = data.variants;
  const attributes = data.attributes;
  const availableAttrs = getAvailableAttributes(
    attributes?.selectedAttributes ?? [],
    attributes?.newAttributes ?? []
  );

  const [variants, setVariants] = useState<IWizardVariant[]>(prevData?.variants ?? []);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<
    Record<string, { valueId: string; valueName: string }>
  >({});

  const { form: variantForm } = useFormHook({
    defaultValues: { name: "", price: "", stock: "" } satisfies WizardVariantFormValues,
    onSubmit: ({ value }: { value: WizardVariantFormValues }) => {
      if (!value.name.trim()) return;
      const price = parseFloat(value.price);
      const stock = parseInt(value.stock, 10);
      if (isNaN(price) || price < 0) return;

      const attributeSelections: IVariantAttributeSelection[] = Object.entries(selections).map(
        ([attrId, sel]) => {
          const attr = availableAttrs.find((a) => a.id === attrId);
          return {
            attributeId: attrId,
            attributeName: attr?.name ?? "",
            valueId: sel.valueId,
            valueName: sel.valueName,
          };
        }
      );

      const variant: IWizardVariant = {
        tempId: `var-${Date.now()}`,
        name: value.name.trim(),
        price,
        stock: isNaN(stock) ? 0 : stock,
        attributeSelections,
      };

      setVariants((prev) => [...prev, variant]);
      variantForm.reset({ defaultValues: { name: "", price: "", stock: "" } });
      setSelections({});
      setShowForm(false);
    },
  });

  useEffect(() => {
    submitRef.current = () => {
      setError(null);
      if (variants.length === 0) {
        setError(t("products.variantsStep.addAtLeastOne"));
        return;
      }
      onComplete({ variants });
    };
  }, [variants, submitRef, onComplete, t]);

  const removeVariant = (tempId: string) => {
    setVariants((prev) => prev.filter((v) => v.tempId !== tempId));
  };

  const selectValue = (attrId: string, valueId: string, valueName: string) => {
    setSelections((prev) => ({ ...prev, [attrId]: { valueId, valueName } }));
  };

  const cancelNewVariant = () => {
    variantForm.reset({ defaultValues: { name: "", price: "", stock: "" } });
    setSelections({});
    setShowForm(false);
  };

  const productImages = (data.productInfo?.images ?? []) as IProductImageDraft[];

  const setVariantLinkedImage = (tempId: string, linkedImageTempId: string | null) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.tempId === tempId ? { ...v, linkedImageTempId } : v
      )
    );
  };

  return {
    error,
    variants,
    removeVariant,
    showForm,
    setShowForm,
    variantForm,
    availableAttrs,
    selections,
    selectValue,
    cancelNewVariant,
    productImages,
    setVariantLinkedImage,
  };
}
