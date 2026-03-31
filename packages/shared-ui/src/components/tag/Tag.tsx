import type { ReactNode } from "react";

type TagVariant = "default" | "success" | "warning" | "danger" | "info";

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<TagVariant, { bg: string; text: string; dot: string }> = {
  default: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  success: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  danger: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  info: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
};

export const Tag = ({ children, variant = "default", dot = false, className = "" }: TagProps) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${styles.bg} ${styles.text} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  );
};
