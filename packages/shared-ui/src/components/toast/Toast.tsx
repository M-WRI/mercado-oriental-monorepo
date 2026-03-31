import { useEffect, useState } from "react";
import { MdCheck, MdClose, MdErrorOutline } from "react-icons/md";

export type ToastVariant = "success" | "error";

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
}

const variantConfig: Record<ToastVariant, { icon: typeof MdCheck; bg: string; text: string; border: string }> = {
  success: {
    icon: MdCheck,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  error: {
    icon: MdErrorOutline,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

export const Toast = ({
  toast,
  onRemove,
}: {
  toast: ToastData;
  onRemove: (id: string) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border shadow-sm text-sm transition-all duration-200 ${config.bg} ${config.text} ${config.border} ${
        isVisible && !isLeaving ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onRemove(toast.id), 200);
        }}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <MdClose size={14} />
      </button>
    </div>
  );
};
