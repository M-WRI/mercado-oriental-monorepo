import { Input } from "./Input"
import { useFieldContext } from "../../../hooks/formHookContexts"

export const NumberField = ({ label }: { label: string }) => {
  const field = useFieldContext<number>()
  const isDirty = field.state?.meta?.isDefaultValue === false
  const errors = field.state?.meta?.errors ?? []
  const error = errors.length > 0 ? errors.join(", ") : undefined
  return (
    <Input
      name={field.name}
      label={label}
      type="number"
      isDirty={isDirty}
      value={field.state?.value}
      error={error}
      onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      onBlur={field.handleBlur}
    />
  )
}
