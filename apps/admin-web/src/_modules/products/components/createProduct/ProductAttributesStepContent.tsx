import { useTranslation } from "react-i18next";
import { Button, Tag } from "@mercado/shared-ui";
import { MdAdd, MdCheck, MdClose } from "react-icons/md";
import type { IProductAttribute, INewAttribute } from "../../types";
import { NewAttributeForm } from "../forms/NewAttributeForm";
import type { useProductAttributesStep } from "../../hooks/useProductAttributesStep";

type ProductAttributesStepContentProps = ReturnType<typeof useProductAttributesStep>;

export function ProductAttributesStepContent({
  existingAttributes,
  selectedIds,
  toggleAttribute,
  newAttributes,
  removeNewAttribute,
  showNewForm,
  setShowNewForm,
  newAttrForm,
}: ProductAttributesStepContentProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-5">{t("products.attributesStep.description")}</p>

      {existingAttributes && existingAttributes.length > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3">
            {t("products.attributesStep.shopAttributes")}
          </h5>
          <div className="grid gap-2">
            {existingAttributes.map((attr) => (
              <AttributePickerRow
                key={attr.id}
                attr={attr}
                selected={selectedIds.has(attr.id)}
                onToggle={() => toggleAttribute(attr.id)}
              />
            ))}
          </div>
        </div>
      )}

      {newAttributes.length > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3">
            {t("products.attributesStep.newAttributes")}
          </h5>
          <div className="grid gap-2">
            {newAttributes.map((attr) => (
              <NewAttributeRow key={attr.tempId} attr={attr} onRemove={removeNewAttribute} />
            ))}
          </div>
        </div>
      )}

      {showNewForm ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">
            {t("products.attributesStep.createNew")}
          </h5>
          <NewAttributeForm form={newAttrForm} onCancel={() => setShowNewForm(false)} />
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
}

function AttributePickerRow({
  attr,
  selected,
  onToggle,
}: {
  attr: IProductAttribute;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg border text-sm transition-colors duration-150 ${
        selected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
          selected ? "bg-gray-900 border-gray-900" : "border-gray-300"
        }`}
      >
        {selected && <MdCheck size={14} className="text-white" />}
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
  );
}

function NewAttributeRow({
  attr,
  onRemove,
}: {
  attr: INewAttribute;
  onRemove: (tempId: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-sm">
      <div className="flex-1 min-w-0">
        <span className="font-medium text-gray-900">{attr.name}</span>
        {attr.description && (
          <span className="block text-xs text-gray-400 mt-0.5">{attr.description}</span>
        )}
        {attr.values.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {attr.values.map((v, i) => (
              <Tag key={i} variant="success">
                {v}
              </Tag>
            ))}
          </div>
        )}
      </div>
      <Button
        onClick={() => onRemove(attr.tempId)}
        style="ghost"
        icon={<MdClose size={18} />}
      />
    </div>
  );
}
