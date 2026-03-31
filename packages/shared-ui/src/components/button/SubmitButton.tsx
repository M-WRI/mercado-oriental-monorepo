import { Button } from "./Button"

export const SubmitButton = ({
  form,
  label = "Submit",
}: {
  form: any
  label?: string
}) => {
  return (
    <Button onClick={() => form.handleSubmit()} fullWidth>
      {label}
    </Button>
  )
}
