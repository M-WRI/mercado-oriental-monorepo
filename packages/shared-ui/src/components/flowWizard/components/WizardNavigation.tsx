import { useTranslation } from "react-i18next";
import { Button } from "../../button/Button";

interface WizardNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  finishText?: string;
}

export const WizardNavigation = ({
  isFirstStep,
  isLastStep,
  onPrev,
  onNext,
  onFinish,
  onCancel,
  isSubmitting = false,
  finishText,
}: WizardNavigationProps) => {
  const { t } = useTranslation();

  return (
    <div className="shrink-0 flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
      <div>
        {isFirstStep && onCancel ? (
          <Button style="link" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        ) : !isFirstStep ? (
          <Button style="link" onClick={onPrev}>
            &larr; {t("common.back")}
          </Button>
        ) : null}
      </div>

      <div>
        {isLastStep ? (
          <Button onClick={onFinish} disabled={isSubmitting}>
            {isSubmitting ? t("common.submitting") : finishText || t("common.create")}
          </Button>
        ) : (
          <Button onClick={onNext}>
            {t("common.continue")} &rarr;
          </Button>
        )}
      </div>
    </div>
  );
};
