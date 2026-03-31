import { createFormHook } from "@tanstack/react-form"
import { CommaSeparatedField, NumberField, TextField, TextAreaField } from "../components/inputs"
import { SubmitButton } from "../components"
import { fieldContext, formContext } from "./formHookContexts"

const { useAppForm } = createFormHook({
    fieldComponents: {
        TextField,
        NumberField,
        CommaSeparatedField,
        TextAreaField,
    },
    formComponents: {
        SubmitButton,
    },
    fieldContext,
    formContext,
})

export type FormFromUseFormHook = ReturnType<typeof useFormHook>["form"];

export const useFormHook = ({ defaultValues, onSubmit }: { defaultValues: any, onSubmit: (value: any) => void }) => {
    const form = useAppForm({
        defaultValues,
        onSubmit,
    })

    return { form }
}
