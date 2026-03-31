import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import type { IShop } from "@/_modules/products/types";

export const AddAttributeForm = ({
    form,
    shops,
    fixedShopId,
    fixedShopName,
}: {
    form: FormFromUseFormHook;
    shops?: IShop[];
    fixedShopId?: string;
    fixedShopName?: string;
}) => {
    const { t } = useTranslation();

    return (
        <form
            className="grid gap-4"
            onSubmit={(e) => e.preventDefault()}
        >
            <form.AppField
                name="shopId"
                validators={{
                    onSubmit: ({ value }) =>
                        !value?.trim() ? t("attributes.shopRequired") : undefined,
                }}
            >
                {(field: any) => {
                    const selectedId = field.state?.value as string;
                    const errors = field.state?.meta?.errors ?? [];
                    const error = errors.length > 0 ? errors.join(", ") : undefined;
                    if (fixedShopId) {
                        return (
                            <div className="grid gap-1.5">
                                <span className="text-sm font-medium text-gray-700">
                                    {t("attributes.shopLabel")}
                                </span>
                                <p className="text-sm text-gray-900 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    {fixedShopName ?? fixedShopId}
                                </p>
                                {error && <span className="text-xs text-red-500">{error}</span>}
                            </div>
                        );
                    }
                    return (
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                {t("attributes.shopLabel")}
                            </label>
                            {shops && shops.length > 0 ? (
                                <div className="grid gap-2">
                                    {shops.map((shop) => (
                                        <button
                                            key={shop.id}
                                            type="button"
                                            onClick={() => field.handleChange(shop.id)}
                                            className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors duration-150 ${
                                                selectedId === shop.id
                                                    ? "border-gray-900 bg-gray-50 text-gray-900"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className="font-medium">{shop.name}</span>
                                            {shop.description && (
                                                <span className="block text-xs text-gray-400 mt-0.5">
                                                    {shop.description}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">{t("attributes.noShops")}</p>
                            )}
                            {error && <span className="text-xs text-red-500">{error}</span>}
                        </div>
                    );
                }}
            </form.AppField>
            <form.AppField
                name="name"
                validators={{
                    onSubmit: ({ value }) => !value?.trim() ? t("attributes.nameRequired") : undefined,
                }}
            >
                {(field: any) => (
                    <field.TextField label={t("attributes.name")} />
                )}
            </form.AppField>
            <form.AppField name="description">
                {(field: any) => (
                    <field.TextField label={t("attributes.description")} />
                )}
            </form.AppField>
            <form.AppField name="values">
                {(field: any) => (
                    <field.CommaSeparatedField label={t("attributes.valuesCommaSeparated")} />
                )}
            </form.AppField>
            <form.AppForm>
                <form.SubmitButton form={form} />
            </form.AppForm>
        </form>
    )
}
