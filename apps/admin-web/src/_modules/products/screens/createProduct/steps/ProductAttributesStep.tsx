import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { ProductAttributesStepContent } from "../../../components/createProduct/ProductAttributesStepContent";
import { useProductAttributesStep } from "../../../hooks";

export const ProductAttributesStep = (props: StepProps) => {
  const step = useProductAttributesStep(props);
  return <ProductAttributesStepContent {...step} />;
};
