import { useState, useEffect, useRef } from "react";
import { MdSearch, MdClose } from "react-icons/md";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchFilter = ({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 350,
}: SearchFilterProps) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (next: string) => {
    setLocal(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), debounceMs);
  };

  const handleClear = () => {
    setLocal("");
    onChange("");
  };

  return (
    <div className="relative">
      <MdSearch
        size={16}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-56 pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 outline-none hover:border-gray-300 focus:border-gray-900 transition-colors duration-150"
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <MdClose size={14} />
        </button>
      )}
    </div>
  );
};
