import { useEffect, useState } from "react";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { useFetch } from "@/_shared/queryProvider";
import { useFormHook } from "@mercado/shared-ui";
import { getAttributesByShop } from "../api";
import type { IProductAttribute, INewAttribute } from "../types";

export type NewAttributeFormValues = {
  name: string;
  description: string;
  values: string[];
};

export function useProductAttributesStep({ data, submitRef, onComplete }: StepProps) {
  const shopId = data.productInfo?.shopId;
  const prevData = data.attributes;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(prevData?.selectedAttributes?.map((a: IProductAttribute) => a.id) ?? [])
  );
  const [newAttributes, setNewAttributes] = useState<INewAttribute[]>(
    prevData?.newAttributes ?? []
  );
  const [showNewForm, setShowNewForm] = useState(false);

  const { data: existingAttributes } = useFetch<IProductAttribute[]>({
    queryKey: getAttributesByShop.queryKey(shopId ?? ""),
    url: getAttributesByShop.url(shopId ?? ""),
    enabled: Boolean(shopId),
  });

  const { form: newAttrForm } = useFormHook({
    defaultValues: { name: "", description: "", values: [] as string[] } satisfies NewAttributeFormValues,
    onSubmit: ({ value }: { value: NewAttributeFormValues }) => {
      if (!value.name.trim()) return;
      const attr: INewAttribute = {
        tempId: `new-${Date.now()}`,
        name: value.name.trim(),
        description: value.description.trim(),
        values: value.values,
      };
      setNewAttributes((prev) => [...prev, attr]);
      newAttrForm.reset({ defaultValues: { name: "", description: "", values: [] } });
      setShowNewForm(false);
    },
  });

  useEffect(() => {
    submitRef.current = () => {
      const selectedAttributes = (existingAttributes ?? []).filter((a) => selectedIds.has(a.id));
      onComplete({ selectedAttributes, newAttributes });
    };
  }, [selectedIds, newAttributes, existingAttributes, submitRef, onComplete]);

  const toggleAttribute = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeNewAttribute = (tempId: string) => {
    setNewAttributes((prev) => prev.filter((a) => a.tempId !== tempId));
  };

  return {
    existingAttributes,
    selectedIds,
    toggleAttribute,
    newAttributes,
    removeNewAttribute,
    showNewForm,
    setShowNewForm,
    newAttrForm,
  };
}
