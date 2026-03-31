import { useState, useRef, useCallback } from "react";
import type { FlowWizardProps } from "../types";
import { WizardHeader } from "./WizardHeader";
import { WizardNavigation } from "./WizardNavigation";

export const FlowWizard = ({
  steps,
  onFinish,
  onCancel,
  initialStep = 0,
  isSubmitting = false,
  finishText,
}: FlowWizardProps) => {
  const [current, setCurrent] = useState(initialStep);
  const [stepsData, setStepsData] = useState<Record<string, any>>({});
  const submitRef = useRef<(() => void) | null>(null);

  const currentStep = steps[current];
  const isFirstStep = current === 0;
  const isLastStep = current === steps.length - 1;

  const handleStepComplete = useCallback(
    (stepData: any) => {
      const updated = { ...stepsData, [currentStep.key]: stepData };
      setStepsData(updated);

      if (isLastStep) {
        onFinish(updated);
      } else {
        setCurrent((prev) => prev + 1);
      }
    },
    [stepsData, currentStep.key, isLastStep, onFinish]
  );

  const handleNext = () => {
    // Trigger the current step's form submission / validation
    if (submitRef.current) {
      submitRef.current();
    }
  };

  const handlePrev = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    // Also trigger validation on the last step before finishing
    if (submitRef.current) {
      submitRef.current();
    }
  };

  const CurrentStepComponent = currentStep.component;

  return (
    <div className="flex flex-col h-full min-h-0">
      <WizardHeader
        currentStep={current}
        totalSteps={steps.length}
        title={currentStep.title}
      />

      {/* Step content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <CurrentStepComponent
          data={stepsData}
          submitRef={submitRef}
          onComplete={handleStepComplete}
        />
      </div>

      <WizardNavigation
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onFinish={handleFinish}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        finishText={finishText}
      />
    </div>
  );
};
