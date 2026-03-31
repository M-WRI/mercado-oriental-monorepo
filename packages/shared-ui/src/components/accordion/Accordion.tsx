import { useState, type ReactNode } from "react";
import { MdChevronRight } from "react-icons/md";

interface AccordionItemProps {
  /** Content shown in the always-visible header row. */
  header: ReactNode;
  children: ReactNode;
  /** Controlled open state. When omitted the item manages its own state. */
  open?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem = ({
  header,
  children,
  open: controlledOpen,
  onToggle,
  defaultOpen = false,
  className = "",
}: AccordionItemProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

  const toggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}
    >
      <div className="flex items-start gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
        <button
          type="button"
          onClick={toggle}
          className="shrink-0 p-0.5 -m-0.5 rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300"
          aria-expanded={isOpen}
        >
          <MdChevronRight
            size={18}
            className={`transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
          />
        </button>
        <div className="flex-1 min-w-0 pt-0.5">{header}</div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100">{children}</div>
      )}
    </div>
  );
};

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export const Accordion = ({ children, className = "" }: AccordionProps) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
};
