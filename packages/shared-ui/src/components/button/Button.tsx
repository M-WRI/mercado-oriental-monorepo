export type ButtonStyle = "primary" | "primaryOutline" | "link" | "danger" | "ghost" | "dashed";

export const Button = ({
  onClick,
  children,
  style = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
}: {
  onClick?: () => void;
  children?: React.ReactNode;
  style?: ButtonStyle;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit";
  className?: string;
}) => {
  return (
    <button
      className={`${buttonStyles[style]} transition-colors duration-150 rounded-md px-3 py-1.5 flex items-center justify-center gap-2 text-sm font-medium ${
        iconPosition === "left" ? "flex-row-reverse" : "flex-row"
      } ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children ? children : null}
    </button>
  );
};

export const buttonStyles: Record<ButtonStyle, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-800",
  primaryOutline:
    "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
  link: "text-gray-500 hover:text-gray-900",
  danger: "text-red-500 hover:text-red-700 hover:bg-red-50",
  ghost: "text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md",
  dashed:
    "border border-dashed border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 w-full px-4 py-3 rounded-lg",
};
