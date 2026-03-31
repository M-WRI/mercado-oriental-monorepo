import { Tag } from "../tag";

interface ChangeIndicatorProps {
  value: number;
  suffix?: string;
}

export const ChangeIndicator = ({ value, suffix }: ChangeIndicatorProps) => {
  if (value === 0) return null;
  const isPositive = value > 0;

  return (
    <Tag variant={isPositive ? "success" : "danger"}>
      <svg
        className={`w-3 h-3 ${isPositive ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 12 12"
      >
        <path
          d="M6 2.5v7M6 2.5L3 5.5M6 2.5l3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {Math.abs(value).toFixed(1)}%{suffix ? ` ${suffix}` : ""}
    </Tag>
  );
};
