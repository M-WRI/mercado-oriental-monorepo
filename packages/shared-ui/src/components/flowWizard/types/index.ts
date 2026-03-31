import type { MutableRefObject } from "react";

export interface StepProps<T extends Record<string, any> = Record<string, any>> {
  /** Accumulated data from all previous steps */
  data: T;
  /** Ref that the step must assign its submit/validate trigger to */
  submitRef: MutableRefObject<(() => void) | null>;
  /** Called by the step when its form is valid — passes step data upward */
  onComplete: (stepData: any) => void;
}

export interface WizardStep {
  /** Unique key used to store this step's data */
  key: string;
  /** Display title shown in the header */
  title: string;
  /** The step component to render */
  component: React.ComponentType<StepProps<any>>;
}

export interface FlowWizardProps {
  steps: WizardStep[];
  onFinish: (allData: Record<string, any>) => void;
  onCancel?: () => void;
  initialStep?: number;
  isSubmitting?: boolean;
  finishText?: string;
}
