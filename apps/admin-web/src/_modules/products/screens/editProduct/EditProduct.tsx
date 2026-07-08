import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useEditProduct } from "../../hooks";
import {
  EditProductHeader,
  EditProductInfoSection,
  EditProductVariantsSection,
  EditProductActions,
} from "../../components/productEdit";

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

  return <EditProductScreen id={id} />;
};

function EditProductScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const edit = useEditProduct(id);

  if (edit.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!edit.product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("products.notFound")}</p>
      </div>
    );
  }

  return (
    <>
      {edit.ModalRenderer}
      <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
        <EditProductHeader productName={edit.product.name} onBack={edit.goToProduct} />

        <form onSubmit={edit.handleSubmit}>
          {edit.error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
              {edit.error}
            </div>
          )}

          <EditProductInfoSection
            name={edit.name}
            onNameChange={edit.setName}
            description={edit.description}
            onDescriptionChange={edit.setDescription}
            images={edit.images}
            onImagesChange={edit.setImages}
            variantOptions={edit.variants.map((v) => ({
              id: v.id,
              tempId: v.tempId,
              name: v.name,
            }))}
            categoryIds={edit.categoryIds}
            categoryNames={edit.categoryNames}
            onToggleCategory={edit.handleToggleCategory}
            categoryTree={edit.categoryTree}
            shopName={edit.product.shop.name}
            isActive={edit.isActive}
            onToggleActive={() => edit.setIsActive((prev) => !prev)}
          />

          <EditProductVariantsSection
            variants={edit.variants}
            duplicateTempIds={edit.duplicateTempIds}
            shopAttributes={edit.shopAttributes}
            attributesShopId={edit.attributesShopId}
            showNewForm={edit.showNewForm}
            onShowNewForm={() => edit.setShowNewForm(true)}
            onOpenAddAttributeModal={edit.openAddAttributeModal}
            onUpdateField={edit.updateVariantField}
            onToggleAttrValue={edit.toggleVariantAttrValue}
            onRemoveVariant={edit.removeVariant}
            newVarName={edit.newVarName}
            onNewVarNameChange={edit.setNewVarName}
            newVarPrice={edit.newVarPrice}
            onNewVarPriceChange={edit.setNewVarPrice}
            newVarStock={edit.newVarStock}
            onNewVarStockChange={edit.setNewVarStock}
            newSelections={edit.newSelections}
            onNewSelectionChange={(attrId, selection) =>
              edit.setNewSelections((prev) => ({ ...prev, [attrId]: selection }))
            }
            onResetNewForm={edit.resetNewForm}
            onAddVariant={edit.handleAddVariant}
          />

          <EditProductActions isPending={edit.isPending} onCancel={edit.goBack} />
        </form>
      </div>
    </>
  );
}
