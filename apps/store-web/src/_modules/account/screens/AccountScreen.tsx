import { Button, useAuth, useFormHook, usePatch, useToast } from "@mercado/shared-ui";
import { updateProfileEndpoint } from "@/_modules/auth/api";
import type { Customer, UpdateProfilePayload } from "@/_modules/auth/types";

export function AccountScreen() {
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
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold">My Account</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
        </div>

        <form.AppField name="name">{(field: any) => <field.TextField label="Name" placeholder="Your name" />}</form.AppField>
        <form.AppField name="phone">{(field: any) => <field.TextField label="Phone" placeholder="+39 02 0000000" />}</form.AppField>

        <Button onClick={() => form.handleSubmit()} disabled={isPending}>
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
