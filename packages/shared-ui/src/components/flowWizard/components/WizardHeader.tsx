import { useTranslation } from "react-i18next";

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

export const WizardHeader = ({ currentStep, totalSteps, title }: WizardHeaderProps) => {
  const { t } = useTranslation();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="shrink-0">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step info */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <span className="text-sm text-gray-400">
          {t("common.step", { current: currentStep + 1, total: totalSteps })}
        </span>
      </div>
    </div>
  );
};
