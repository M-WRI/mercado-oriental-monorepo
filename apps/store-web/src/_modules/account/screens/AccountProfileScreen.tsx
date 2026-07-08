import { Button, useAuth, useFormHook, usePatch, useToast } from "@mercado/shared-ui";
import { updateProfileEndpoint } from "@/_modules/auth/api";
import type { Customer, UpdateProfilePayload } from "@/_modules/auth/types";

export function AccountProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { success } = useToast();
  const { mutate, isPending } = usePatch<UpdateProfilePayload, Customer>();

  const { form } = useFormHook({
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    } as UpdateProfilePayload,
    onSubmit: ({ value }: { value: UpdateProfilePayload }) =>
      mutate(
        {
          url: updateProfileEndpoint.url,
          data: {
            name: value.name?.trim() || undefined,
            phone: value.phone?.trim() || undefined,
          },
        },
        {
          onSuccess: async () => {
            await refreshUser();
            success("Profile updated.");
          },
        },
      ),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your contact details. Email cannot be changed here.
        </p>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
        <p className="text-sm text-gray-900 mt-1">{user?.email}</p>
      </div>

      <form.AppField name="name">
        {(field: any) => <field.TextField label="Name" placeholder="Your name" />}
      </form.AppField>
      <form.AppField name="phone">
        {(field: any) => <field.TextField label="Phone" placeholder="+49 151 12345678" />}
      </form.AppField>

      <Button onClick={() => form.handleSubmit()} disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </div>
  );
}
