import { Link, useNavigate } from "react-router";
import { Button, useAuth, useFormHook, usePost, useToast } from "@mercado/shared-ui";
import { loginEndpoint } from "../api";
import type { CustomerAuthResponse, LoginPayload } from "../types";

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success } = useToast();
  const { mutate, isPending, error } = usePost<LoginPayload, CustomerAuthResponse>();

  const { form } = useFormHook({
    defaultValues: { email: "", password: "" } as LoginPayload,
    onSubmit: ({ value }: { value: LoginPayload }) => {
      mutate(
        { url: loginEndpoint.url, data: value },
        {
          onSuccess: (response) => {
            login(response.token, response.customer);
            success("Signed in successfully.");
            navigate("/", { replace: true });
          },
        }
      );
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Customer Login</h1>
        {error && <p className="text-sm text-red-600">Unable to login. Please check your credentials.</p>}
        <form.AppField
          name="email"
          validators={{
            onSubmit: ({ value }) => (!value?.trim() ? "Email is required" : !value.includes("@") ? "Invalid email" : undefined),
          }}
        >
          {(field: any) => <field.TextField label="Email" type="email" placeholder="you@example.com" />}
        </form.AppField>
        <form.AppField name="password" validators={{ onSubmit: ({ value }) => (!value ? "Password is required" : undefined) }}>
          {(field: any) => <field.TextField label="Password" type="password" placeholder="Your password" />}
        </form.AppField>
        <Button onClick={() => form.handleSubmit()} disabled={isPending} fullWidth>
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
        <p className="text-sm text-gray-600 text-center">
          No account?{" "}
          <Link to="/register" className="font-medium text-gray-900 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
