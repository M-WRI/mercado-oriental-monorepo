import { Input } from "./Input"
import { useFieldContext } from "../../../hooks/formHookContexts"

export const TextField = ({
  label,
  type = "text",
  placeholder,
}: {
  label: string
  type?: string
  placeholder?: string
}) => {
  const field = useFieldContext<string>()
  const isDirty = field.state?.meta?.isDefaultValue === false
  const errors = field.state?.meta?.errors ?? []
  const error = errors.length > 0 ? errors.join(", ") : undefined
  return (
    <Input
      name={field.name}
      label={label}
      type={type}
      isDirty={isDirty}
      value={field.state?.value}
      placeholder={placeholder}
      error={error}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
    />
  )
}
