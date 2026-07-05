import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

type Align = "start" | "end";
type Side = "top" | "bottom" | "right";

type DropdownTriggerProps = {
  onClick?: (event: React.MouseEvent) => void;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "menu";
  "aria-controls"?: string;
};

export interface DropdownProps {
  trigger: ReactElement<DropdownTriggerProps>;
  children: ReactNode;
  align?: Align;
  side?: Side;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = "start",
  side = "top",
  disabled = false,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const handleTriggerClick = (event: React.MouseEvent) => {
    trigger.props.onClick?.(event);
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: handleTriggerClick,
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-controls": open ? menuId : undefined,
      })
    : trigger;

  const positionClass =
    side === "right"
      ? "left-full ml-2 bottom-0"
      : `${side === "top" ? "bottom-full mb-2" : "top-full mt-2"} ${
          align === "end" ? "right-0" : "left-0"
        }`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {triggerNode}
      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute z-50 min-w-[12rem] py-1 bg-white border border-gray-200 rounded-lg shadow-lg ${positionClass}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-2 border-b border-gray-100">
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  destructive = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-gray-100" role="separator" />;
}
