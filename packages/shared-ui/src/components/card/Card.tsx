interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg"
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
}

export const Card = ({ children, className = "", padding = "md" }: CardProps) => {
  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  action?: React.ReactNode
}

export const CardHeader = ({ title, action }: CardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <h6 className="text-sm font-medium text-gray-700">{title}</h6>
      {action}
    </div>
  )
}

interface CardStatProps {
  label: string
  value: string | number
  sub?: string
  change?: React.ReactNode
}

export const CardStat = ({ label, value, sub, change }: CardStatProps) => {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mt-1.5">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
