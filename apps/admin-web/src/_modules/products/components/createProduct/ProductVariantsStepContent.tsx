import { useTranslation } from "react-i18next";
import { Button, Tag } from "@mercado/shared-ui";
import { MdAdd, MdClose } from "react-icons/md";
import type { IWizardVariant, IProductImageDraft } from "../../types";
import { WizardVariantForm } from "./WizardVariantForm";
import type { useProductVariantsStep } from "../../hooks/useProductVariantsStep";

type ProductVariantsStepContentProps = ReturnType<typeof useProductVariantsStep>;

export function ProductVariantsStepContent(props: ProductVariantsStepContentProps) {
  const { t } = useTranslation();
  const {
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
  } = props;

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-5">{t("products.variantsStep.description")}</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
      )}

      {variants.length > 0 && (
        <div className="mb-6 grid gap-2">
          {variants.map((v) => (
            <VariantRow
              key={v.tempId}
              variant={v}
              productImages={productImages}
              onRemove={removeVariant}
              onLinkImage={setVariantLinkedImage}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-4">
            {t("products.variantsStep.newVariant")}
          </h5>
          <WizardVariantForm
            form={variantForm}
            availableAttrs={availableAttrs}
            selections={selections}
            onSelectValue={selectValue}
            onCancel={cancelNewVariant}
          />
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          style="dashed"
          icon={<MdAdd size={18} />}
        >
          {t("products.variantsStep.addVariant")}
        </Button>
      )}
    </div>
  );
}

function VariantRow({
  variant,
  productImages,
  onRemove,
  onLinkImage,
}: {
  variant: IWizardVariant;
  productImages: IProductImageDraft[];
  onRemove: (tempId: string) => void;
  onLinkImage: (tempId: string, linkedImageTempId: string | null) => void;
}) {
  const { t } = useTranslation();
  const linkedImage = productImages.find((img) => img.tempId === variant.linkedImageTempId);

  return (
    <div className="flex items-start gap-3 border border-gray-200 rounded-lg p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          {linkedImage ? (
            <img
              src={linkedImage.url}
              alt=""
              className="w-10 h-10 rounded-md object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 shrink-0" />
          )}
          <span className="font-medium text-gray-900 text-sm">{variant.name}</span>
          <span className="text-xs text-gray-400">
            €{variant.price.toFixed(2)} · {variant.stock} in stock
          </span>
        </div>
        {variant.attributeSelections.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {variant.attributeSelections.map((sel) => (
              <Tag key={sel.attributeId}>
                {sel.attributeName}: {sel.valueName}
              </Tag>
            ))}
          </div>
        )}
        {productImages.length > 0 && (
          <div className="mt-3 grid gap-1">
            <label className="text-xs font-medium text-gray-500">
              {t("products.variantsStep.linkedImageLabel")}
            </label>
            <select
              value={variant.linkedImageTempId ?? ""}
              onChange={(e) =>
                onLinkImage(variant.tempId, e.target.value || null)
              }
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white max-w-xs"
            >
              <option value="">{t("products.variantsStep.noLinkedImage")}</option>
              {productImages.map((img) => (
                <option key={img.tempId} value={img.tempId}>
                  {img.isPrimary
                    ? t("products.infoStep.imagePrimaryBadge")
                    : t("products.variantsStep.galleryImage", {
                        index: img.sortOrder + 1,
                      })}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <Button
        onClick={() => onRemove(variant.tempId)}
        style="ghost"
        icon={<MdClose size={18} />}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}
