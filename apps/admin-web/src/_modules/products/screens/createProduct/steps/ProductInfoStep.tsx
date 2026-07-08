import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { ProductInfoFields } from "../../../components/forms";
import { useProductInfoStep } from "../../../hooks";

export const ProductInfoStep = (props: StepProps) => {
  const step = useProductInfoStep(props);

  return (
    <div className="max-w-lg">
      {step.error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
          {step.error}
        </div>
      )}

      <ProductInfoFields
        name={step.name}
        onNameChange={step.setName}
        description={step.description}
        onDescriptionChange={step.setDescription}
        images={step.images}
        onImagesChange={step.setImages}
        categoryIds={step.categoryIds}
        categoryNames={step.categoryNames}
        onToggleCategory={step.handleToggleCategory}
        categoryTree={step.categoryTree}
        shopName={step.shopName}
      />
    </div>
  );
};
