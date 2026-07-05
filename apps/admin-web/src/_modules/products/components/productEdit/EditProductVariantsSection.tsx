import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { MdAdd } from "react-icons/md";
import type { IEditableVariant, IProductAttribute } from "../../types";
import { VariantEditorCard } from "./VariantEditorCard";
import { NewVariantForm } from "./NewVariantForm";

interface EditProductVariantsSectionProps {
  variants: IEditableVariant[];
  duplicateTempIds: Set<string>;
  shopAttributes: IProductAttribute[] | undefined;
  attributesShopId: string | undefined;
  showNewForm: boolean;
  onShowNewForm: () => void;
  onOpenAddAttributeModal: () => void;
  onUpdateField: (tempId: string, field: "name" | "price" | "stock", value: string) => void;
  onToggleAttrValue: (
    tempId: string,
    attrId: string,
    attrName: string,
    valueId: string,
    valueName: string
  ) => void;
  onRemoveVariant: (tempId: string) => void;
  newVarName: string;
  onNewVarNameChange: (value: string) => void;
  newVarPrice: string;
  onNewVarPriceChange: (value: string) => void;
  newVarStock: string;
  onNewVarStockChange: (value: string) => void;
  newSelections: Record<string, { valueId: string; valueName: string }>;
  onNewSelectionChange: (
    attrId: string,
    selection: { valueId: string; valueName: string }
  ) => void;
  onResetNewForm: () => void;
  onAddVariant: () => void;
}

export function EditProductVariantsSection({
  variants,
  duplicateTempIds,
  shopAttributes,
  attributesShopId,
  showNewForm,
  onShowNewForm,
  onOpenAddAttributeModal,
  onUpdateField,
  onToggleAttrValue,
  onRemoveVariant,
  newVarName,
  onNewVarNameChange,
  newVarPrice,
  onNewVarPriceChange,
  newVarStock,
  onNewVarStockChange,
  newSelections,
  onNewSelectionChange,
  onResetNewForm,
  onAddVariant,
}: EditProductVariantsSectionProps) {
  const { t } = useTranslation();

  return (
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
            onOpenAddAttributeModal();
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
          {variants.map((v) => (
            <VariantEditorCard
              key={v.tempId}
              variant={v}
              shopAttributes={shopAttributes}
              isDuplicate={duplicateTempIds.has(v.tempId)}
              onUpdateField={onUpdateField}
              onToggleAttrValue={onToggleAttrValue}
              onRemove={onRemoveVariant}
            />
          ))}
        </div>
      )}

      {showNewForm ? (
        <NewVariantForm
          shopAttributes={shopAttributes}
          newVarName={newVarName}
          onNewVarNameChange={onNewVarNameChange}
          newVarPrice={newVarPrice}
          onNewVarPriceChange={onNewVarPriceChange}
          newVarStock={newVarStock}
          onNewVarStockChange={onNewVarStockChange}
          newSelections={newSelections}
          onNewSelectionChange={(attrId, selection) =>
            onNewSelectionChange(attrId, selection)
          }
          onCancel={onResetNewForm}
          onAdd={onAddVariant}
        />
      ) : (
        <Button onClick={onShowNewForm} style="dashed" icon={<MdAdd size={18} />}>
          {t("products.variantsStep.addVariant")}
        </Button>
      )}
    </div>
  );
}
