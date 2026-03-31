import { Link, useNavigate } from "react-router";
import { Button, useAuth, useFormHook, usePost, useToast } from "@mercado/shared-ui";
import { registerEndpoint } from "../api";
import type { CustomerAuthResponse, RegisterPayload } from "../types";

export function RegisterScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success } = useToast();
  const { mutate, isPending, error } = usePost<RegisterPayload, CustomerAuthResponse>();

  const { form } = useFormHook({
    defaultValues: { name: "", phone: "", email: "", password: "" } as RegisterPayload,
    onSubmit: ({ value }: { value: RegisterPayload }) =>
      mutate(
        {
          url: registerEndpoint.url,
          data: {
            name: value.name?.trim() || undefined,
            phone: value.phone?.trim() || undefined,
            email: value.email,
            password: value.password,
          },
        },
        {
          onSuccess: (response) => {
            login(response.token, response.customer);
            success("Account created successfully.");
            navigate("/", { replace: true });
          },
        }
      ),
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create Customer Account</h1>
        {error && <p className="text-sm text-red-600">Could not create account.</p>}
        <form.AppField name="name">{(field: any) => <field.TextField label="Name" placeholder="Your name" />}</form.AppField>
        <form.AppField name="phone">{(field: any) => <field.TextField label="Phone" placeholder="+39 02 0000000" />}</form.AppField>
        <form.AppField
          name="email"
          validators={{
            onSubmit: ({ value }) => (!value?.trim() ? "Email is required" : !value.includes("@") ? "Invalid email" : undefined),
          }}
        >
          {(field: any) => <field.TextField label="Email" type="email" placeholder="you@example.com" />}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{
            onSubmit: ({ value }) => (!value ? "Password is required" : value.length < 6 ? "Password must be at least 6 characters" : undefined),
          }}
        >
          {(field: any) => <field.TextField label="Password" type="password" placeholder="Choose a password" />}
        </form.AppField>
        <Button onClick={() => form.handleSubmit()} disabled={isPending} fullWidth>
          {isPending ? "Creating..." : "Create Account"}
        </Button>
        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
