"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Reusable React Hook Form fields. Every form of the site (service enquiry,
// contact page, callback rail) is built from these, so labels, errors and
// accessibility behave the same everywhere.
//
//   <TextField name="name" label="Your name" required register={register} error={errors.name?.message} />
//
// variant "rail"    -> the compact callback form (CSS classes of the rail)
// variant "section" -> the large form of the page sections (Tailwind classes)

// Tailwind classes of the "section" variant.
export const LABEL = "text-[13px] font-medium text-[#09263e]";
export const ERROR = "text-xs text-red-600";

export const FIELD =
  "!block !h-14 !w-full !rounded-2xl !border !border-solid !border-slate-300 !bg-white !px-5 !text-[15px] !text-[#09263e] !shadow-none placeholder:!text-slate-400 focus-visible:!border-[#1f5d57] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/25";

export const AREA =
  "!block !w-full !resize-none !rounded-2xl !border !border-solid !border-slate-300 !bg-white !px-5 !py-4 !text-[15px] !text-[#09263e] !shadow-none focus-visible:!border-[#1f5d57] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/25";

// Label + control + error message.
export function FormField({ id, label, required, error, hint, variant = "rail", className = "", children }) {
  const section = variant === "section";
  return (
    <div className={`${section ? "flex flex-col gap-1.5" : "contact-field"} ${className}`.trim()}>
      <Label htmlFor={id} className={section ? LABEL : undefined}>
        {label} {required && <span aria-hidden="true">*</span>}
      </Label>
      {children}
      {hint && (
        <small id={`${id}-hint`} className={section ? "text-xs text-slate-500" : "contact-demo-note"}>
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} role="alert" className={section ? ERROR : "field-error"}>
          {error}
        </small>
      )}
    </div>
  );
}

const describedBy = (id, error, hint) =>
  [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

// Single-line input registered with React Hook Form.
export function TextField({ id, name, label, required, register, error, hint, variant = "rail", className, ...inputProps }) {
  return (
    <FormField id={id} label={label} required={required} error={error} hint={hint} variant={variant} className={className}>
      <Input
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)}
        className={variant === "section" ? FIELD : undefined}
        {...inputProps}
        {...register(name)}
      />
    </FormField>
  );
}

// Multi-line input registered with React Hook Form.
export function TextAreaField({ id, name, label, required, register, error, hint, variant = "rail", rows, className, ...areaProps }) {
  return (
    <FormField id={id} label={label} required={required} error={error} hint={hint} variant={variant} className={className}>
      <Textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)}
        className={variant === "section" ? AREA : undefined}
        {...areaProps}
        {...register(name)}
      />
    </FormField>
  );
}

// Hidden spam trap. Visitors never see or fill it; bots do, and the API then
// quietly ignores the submission.
export function HoneypotField({ register, name = "website" }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...register(name)} />
      </label>
    </div>
  );
}

// Success / error line shown under a form after it was submitted.
export function FormStatus({ success, error, variant = "rail" }) {
  const section = variant === "section";
  return (
    <>
      {success && (
        <p className={section ? "text-sm text-green-700" : "contact-status text-sm text-green-700"} role="status">
          {success}
        </p>
      )}
      {error && (
        <p className={section ? "text-sm text-red-600" : "contact-status text-sm text-red-600"} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
