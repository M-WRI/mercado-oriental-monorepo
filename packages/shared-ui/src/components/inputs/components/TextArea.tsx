type TextAreaProps = {
  name: string
  label: string
  isDirty?: boolean
  value?: string
  placeholder?: string
  rows?: number
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: () => void
}

export const TextArea = ({
  name,
  label,
  isDirty = false,
  value,
  placeholder,
  rows = 3,
  onChange,
  onBlur,
}: TextAreaProps) => {
  const borderClass = isDirty
    ? "border-gray-900"
    : "border-gray-200 hover:border-gray-300 focus:border-gray-900"
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <textarea
        className={`w-full px-3 py-2 border ${borderClass} rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors duration-150 resize-none`}
        name={name}
        rows={rows}
        placeholder={placeholder ?? label}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  )
}
