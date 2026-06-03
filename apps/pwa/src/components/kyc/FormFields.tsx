import type { FieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";

// Local Input component matching basic-info.tsx style
function Input({
  type = "text",
  placeholder,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}

type FieldProps = {
  label: string;
  fieldKey?: string;
  hasError?: boolean;
  children: ReactNode;
};

export function Field({ label, fieldKey, hasError, children }: FieldProps) {
  return (
    <div
      id={fieldKey ? `kyc-field-${fieldKey}` : undefined}
      className={
        hasError ? "rounded-2xl border border-red-300 bg-red-50 p-3" : ""
      }
    >
      <label
        className={`mb-1 block text-sm font-semibold ${hasError ? "text-red-700" : "text-gray-800"}`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

type NameFieldPairProps = {
  form: any;
  nameField: string;
  surnameField: string;
  nameLabel?: string;
  surnameLabel?: string;
  namePlaceholder?: string;
  surnamePlaceholder?: string;
};

export function NameFieldPair({
  form,
  nameField,
  surnameField,
  nameLabel = "Name (English)",
  surnameLabel = "Surname (English)",
  namePlaceholder = "Name",
  surnamePlaceholder = "Surname",
}: NameFieldPairProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={nameLabel}>
        <form.Field name={nameField}>
          {(field: FieldApi<any, any, any, any>) => (
            <Input
              placeholder={namePlaceholder}
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value as never)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </Field>
      <Field label={surnameLabel}>
        <form.Field name={surnameField}>
          {(field: FieldApi<any, any, any, any>) => (
            <Input
              placeholder={surnamePlaceholder}
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value as never)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </Field>
    </div>
  );
}

type GenerationalSectionProps = {
  form: any;
  title: string;
  nepaliTitle: string;
  prefix: string;
};

export function GenerationalSection({
  form,
  title,
  nepaliTitle,
  prefix,
}: GenerationalSectionProps) {
  return (
    <div className="space-y-4 rounded-xl bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">
        {title} ({nepaliTitle})
      </h3>
      <NameFieldPair
        form={form}
        nameField={`${prefix}_nameEn`}
        surnameField={`${prefix}_surnameEn`}
      />
      <NameFieldPair
        form={form}
        nameField={`${prefix}_nameNp`}
        surnameField={`${prefix}_surnameNp`}
        nameLabel="नाम (Nepali)"
        surnameLabel="थर (Nepali)"
        namePlaceholder="नाम"
        surnamePlaceholder="थर"
      />
    </div>
  );
}
