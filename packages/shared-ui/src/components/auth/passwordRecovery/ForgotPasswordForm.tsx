import { useFormHook } from "../../../hooks/useFormHook";
import { Button } from "../../button/Button";
import type { PasswordRecoveryLabels } from "./types";

interface ForgotPasswordFormProps {
  labels: Pick<
    PasswordRecoveryLabels,
    | "email"
    | "emailPlaceholder"
    | "sendResetLink"
    | "loading"
    | "forgotPasswordSent"
  > & {
    emailRequired: string;
    emailInvalid: string;
  };
  onSubmit: (email: string) => void;
  isPending: boolean;
  isSuccess: boolean;
}

export function ForgotPasswordForm({
  labels,
  onSubmit,
  isPending,
  isSuccess,
}: ForgotPasswordFormProps) {
  const { form } = useFormHook({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => {
      onSubmit(value.email.trim());
    },
  });

  if (isSuccess) {
    return <p className="text-sm text-gray-600">{labels.forgotPasswordSent}</p>;
  }

  return (
    <div className="grid gap-4">
      <form.AppField
        name="email"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim()
              ? labels.emailRequired
              : !value.includes("@")
                ? labels.emailInvalid
                : undefined,
        }}
      >
        {(field: any) => (
          <field.TextField label={labels.email} type="email" placeholder={labels.emailPlaceholder} />
        )}
      </form.AppField>
      <Button onClick={() => form.handleSubmit()} disabled={isPending} fullWidth>
        {isPending ? labels.loading : labels.sendResetLink}
      </Button>
    </div>
  );
}
