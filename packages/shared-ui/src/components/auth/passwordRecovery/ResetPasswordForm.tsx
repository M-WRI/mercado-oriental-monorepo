import { useState } from "react";
import { useFormHook } from "../../../hooks/useFormHook";
import { Button } from "../../button/Button";
import type { PasswordRecoveryLabels } from "./types";

interface ResetPasswordFormProps {
  labels: Pick<
    PasswordRecoveryLabels,
    | "newPassword"
    | "confirmPassword"
    | "resetPasswordSubmit"
    | "loading"
    | "resetPasswordFailed"
    | "passwordMismatch"
    | "passwordMinLength"
  >;
  onSubmit: (newPassword: string) => void;
  isPending: boolean;
  hasError?: boolean;
  minPasswordLength?: number;
}

export function ResetPasswordForm({
  labels,
  onSubmit,
  isPending,
  hasError = false,
  minPasswordLength = 8,
}: ResetPasswordFormProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const { form } = useFormHook({
    defaultValues: { newPassword: "", confirmPassword: "" },
    onSubmit: ({ value }) => {
      setValidationError(null);

      if (value.newPassword.length < minPasswordLength) {
        setValidationError(labels.passwordMinLength);
        return;
      }
      if (value.newPassword !== value.confirmPassword) {
        setValidationError(labels.passwordMismatch);
        return;
      }

      onSubmit(value.newPassword);
    },
  });

  const displayError = validationError ?? (hasError ? labels.resetPasswordFailed : null);

  return (
    <>
      {displayError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
          {displayError}
        </div>
      )}

      <div className="grid gap-4">
        <form.AppField name="newPassword">
          {(field: any) => (
            <field.TextField label={labels.newPassword} type="password" />
          )}
        </form.AppField>
        <form.AppField name="confirmPassword">
          {(field: any) => (
            <field.TextField label={labels.confirmPassword} type="password" />
          )}
        </form.AppField>
        <Button onClick={() => form.handleSubmit()} disabled={isPending} fullWidth>
          {isPending ? labels.loading : labels.resetPasswordSubmit}
        </Button>
      </div>
    </>
  );
}
