import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { ProductVariantsStepContent } from "../../../components/createProduct/ProductVariantsStepContent";
import { useProductVariantsStep } from "../../../hooks";

export const ProductVariantsStep = (props: StepProps) => {
  const step = useProductVariantsStep(props);
  return <ProductVariantsStepContent {...step} />;
};
