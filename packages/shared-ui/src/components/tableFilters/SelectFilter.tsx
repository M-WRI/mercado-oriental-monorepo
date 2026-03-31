import { useTranslation } from "react-i18next";

interface SelectFilterProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export const SelectFilter = ({
  label: _label,
  value,
  options,
  onChange,
}: SelectFilterProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("")}
        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
          !value
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-500 hover:bg-gray-50"
        }`}
      >
        {t("filters.all")}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
