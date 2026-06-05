import * as React from "react"
import { Slot } from "radix-ui"
import { Controller, FormProvider, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function Form({
  ...props
}) {
  return <FormProvider {...props} />;
}

const FormFieldContext = React.createContext({})

function FormField({
  ...props
}) {
  return (
    <Controller
      {...props}
      render={({ field, fieldState, formState }) => {
        const fieldId = React.useId()
        const itemId = `${fieldId}-form-item`
        const descriptionId = `${fieldId}-form-item-description`
        const messageId = `${fieldId}-form-item-message`

        return (
          <FormFieldContext.Provider
            value={{
              id: fieldId,
              name: props.name,
              formItemId: itemId,
              formDescriptionId: descriptionId,
              formMessageId: messageId,
              ...field,
              error: fieldState.error,
            }}>
            {typeof props.render === "function"
              ? props.render({ field, fieldState, formState })
              : props.children}
          </FormFieldContext.Provider>
        )
      }}
    />
  );
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItemContext = React.createContext({})

function FormItem({
  className,
  ...props
}) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("space-y-1.5", className)}
        {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      htmlFor={formItemId}
      className={cn(error && "text-destructive", className)}
      {...props} />
  );
}

function FormControl({
  ...props
}) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props} />
  );
}

function FormDescription({
  className,
  ...props
}) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-[0.7rem] leading-relaxed text-muted-foreground", className)}
      {...props} />
  );
}

function FormMessage({
  className,
  children,
  ...props
}) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-[0.7rem] leading-relaxed text-destructive font-medium", className)}
      {...props}>
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
