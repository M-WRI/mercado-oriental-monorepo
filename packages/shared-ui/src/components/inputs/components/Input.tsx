type InputProps = {
  name: string
  label: string
  type?: string
  isDirty?: boolean
  value?: string | number
  placeholder?: string
  error?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
}

export const Input = ({
  name,
  label,
  type = "text",
  isDirty = false,
  value,
  placeholder,
  error,
  onChange,
  onBlur,
}: InputProps) => {
  const borderClass = error
    ? "border-red-400"
    : isDirty
      ? "border-gray-900"
      : "border-gray-200 hover:border-gray-300 focus:border-gray-900"
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        className={`w-full px-3 py-2 border ${borderClass} rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors duration-150`}
        type={type}
        name={name}
        placeholder={placeholder ?? label}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
}
