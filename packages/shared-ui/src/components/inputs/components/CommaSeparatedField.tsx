import { useState } from "react"
import { useFieldContext } from "../../../hooks/formHookContexts"

const parseCommaSeparated = (str: string): string[] =>
  str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

export const CommaSeparatedField = ({ label }: { label: string }) => {
  const field = useFieldContext<string[]>()
  const [inputValue, setInputValue] = useState("")
  const isDirty = field.state?.meta?.isDefaultValue === false
  const value = field.state?.value ?? []

  const removeAt = (index: number) => {
    field.handleChange((prev) => prev.filter((_, i) => i !== index))
  }

  const addFromInput = () => {
    const parsed = parseCommaSeparated(inputValue)
    if (parsed.length > 0) {
      field.handleChange((prev) => [...prev, ...parsed])
      setInputValue("")
    }
    field.handleBlur()
  }

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-gray-700" htmlFor={field.name}>
        {label}
      </label>
      <div
        className={`flex flex-wrap gap-1.5 rounded-lg border px-3 py-2 min-h-[2.5rem] transition-colors duration-150 ${
          isDirty ? "border-gray-900" : "border-gray-200 focus-within:border-gray-900 hover:border-gray-300"
        }`}
      >
        {value.map(
          (item, index) =>
            item && (
              <span
                key={`${index}-${item}`}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-sm text-gray-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="ml-0.5 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 focus:outline-none"
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              </span>
            )
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={addFromInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addFromInput()
            }
          }}
          placeholder={value.length === 0 ? "Type values, separate with comma" : "Add more..."}
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  )
}
