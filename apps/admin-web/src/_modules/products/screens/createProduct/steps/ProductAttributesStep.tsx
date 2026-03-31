import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { useFetch } from "@/_shared/queryProvider";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { Button, Tag } from "@mercado/shared-ui";
import { getAttributesByShop } from "@/_modules/products/api";
import type { IProductAttribute, INewAttribute } from "@/_modules/products/types";
import { MdAdd, MdCheck, MdClose } from "react-icons/md";

export const ProductAttributesStep = ({ data, submitRef, onComplete }: StepProps) => {
  const { t } = useTranslation();
  const shopId = data.productInfo?.shopId;
  const prevData = data.attributes;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(prevData?.selectedAttributes?.map((a: IProductAttribute) => a.id) ?? [])
  );
  const [newAttributes, setNewAttributes] = useState<INewAttribute[]>(
    prevData?.newAttributes ?? []
  );
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newValues, setNewValues] = useState("");

  const { data: existingAttributes } = useFetch<IProductAttribute[]>({
    queryKey: getAttributesByShop.queryKey(shopId ?? ""),
    url: getAttributesByShop.url(shopId ?? ""),
    enabled: Boolean(shopId),
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

  const handleAddNew = () => {
    if (!newName.trim()) return;
    const values = newValues.split(",").map((v) => v.trim()).filter(Boolean);
    const attr: INewAttribute = {
      tempId: `new-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim(),
      values,
    };
    setNewAttributes((prev) => [...prev, attr]);
    resetNewForm();
  };

  const resetNewForm = () => {
    setNewName("");
    setNewDescription("");
    setNewValues("");
    setShowNewForm(false);
  };

  const removeNewAttribute = (tempId: string) => {
    setNewAttributes((prev) => prev.filter((a) => a.tempId !== tempId));
  };

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-5">
        {t("products.attributesStep.description")}
      </p>

      {/* Existing attributes */}
      {existingAttributes && existingAttributes.length > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3">{t("products.attributesStep.shopAttributes")}</h5>
          <div className="grid gap-2">
            {existingAttributes.map((attr) => (
              <button
                key={attr.id}
                type="button"
                onClick={() => toggleAttribute(attr.id)}
                className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg border text-sm transition-colors duration-150 ${
                  selectedIds.has(attr.id)
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    selectedIds.has(attr.id) ? "bg-gray-900 border-gray-900" : "border-gray-300"
                  }`}
                >
                  {selectedIds.has(attr.id) && <MdCheck size={14} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{attr.name}</span>
                  {attr.description && (
                    <span className="block text-xs text-gray-400 mt-0.5">{attr.description}</span>
                  )}
                  {attr.productAttributeValues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {attr.productAttributeValues.map((v) => (
                        <Tag key={v.id}>{v.value}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New attributes */}
      {newAttributes.length > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3">{t("products.attributesStep.newAttributes")}</h5>
          <div className="grid gap-2">
            {newAttributes.map((attr) => (
              <div
                key={attr.tempId}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{attr.name}</span>
                  {attr.description && (
                    <span className="block text-xs text-gray-400 mt-0.5">{attr.description}</span>
                  )}
                  {attr.values.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {attr.values.map((v, i) => (
                        <Tag key={i} variant="success">{v}</Tag>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => removeNewAttribute(attr.tempId)}
                  style="ghost"
                  icon={<MdClose size={18} />}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new attribute form */}
      {showNewForm ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">{t("products.attributesStep.createNew")}</h5>
          <div className="grid gap-3">
            <Input
              name="attrName"
              label={t("products.attributesStep.nameLabel")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("products.attributesStep.namePlaceholder")}
            />
            <Input
              name="attrDescription"
              label={t("products.attributesStep.descriptionLabel")}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={t("products.attributesStep.descriptionPlaceholder")}
            />
            <Input
              name="attrValues"
              label={t("products.attributesStep.valuesLabel")}
              value={newValues}
              onChange={(e) => setNewValues(e.target.value)}
              placeholder={t("products.attributesStep.valuesPlaceholder")}
            />
            <div className="flex gap-2 justify-end">
              <Button style="link" onClick={resetNewForm}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleAddNew} disabled={!newName.trim()}>
                {t("common.add")}
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
          {t("products.attributesStep.createNew")}
        </Button>
      )}
    </div>
  );
};
