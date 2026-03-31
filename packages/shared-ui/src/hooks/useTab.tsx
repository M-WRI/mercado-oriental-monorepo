import { useState, useCallback, type ReactElement } from "react";

export interface Tab<T extends string = string> {
  value: T;
  label: string;
}

export interface UseTabReturn<T extends string> {
  active: T;
  setActive: (value: T) => void;
  tabs: Tab<T>[];
  Tabs: () => ReactElement;
}

interface UseTabOptions<T extends string> {
  tabs: Tab<T>[];
  defaultValue?: T;
}

export function useTab<T extends string>({
  tabs,
  defaultValue,
}: UseTabOptions<T>): UseTabReturn<T> {
  const [active, setActive] = useState<T>(defaultValue ?? tabs[0].value);

  const handleSet = useCallback((value: T) => setActive(value), []);

  const Tabs = useCallback(
    () => (
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleSet(tab.value)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              active === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    ),
    [tabs, active, handleSet]
  );

  return { active, setActive: handleSet, tabs, Tabs };
}
