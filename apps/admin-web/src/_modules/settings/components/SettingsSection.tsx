import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function SettingsSection({
  title,
  subtitle,
  children,
  className = "",
}: SettingsSectionProps) {
  return (
    <section className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <h5 className="text-sm font-semibold text-gray-900 mb-1">{title}</h5>
      {subtitle && <p className="text-xs text-gray-500 mb-5">{subtitle}</p>}
      {children}
    </section>
  );
}
