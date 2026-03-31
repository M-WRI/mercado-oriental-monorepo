import { TextArea } from "./TextArea"
import { useFieldContext } from "../../../hooks/formHookContexts"

export const TextAreaField = ({
  label,
  placeholder,
  rows,
}: {
  label: string
  placeholder?: string
  rows?: number
}) => {
  const field = useFieldContext<string>()
  const isDirty = field.state?.meta?.isDefaultValue === false
  return (
    <TextArea
      name={field.name}
      label={label}
      isDirty={isDirty}
      value={field.state?.value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
    />
  )
}
