"use client";

import { useTranslations } from "next-intl";

import { PHONE_HREF, PHONE_LABEL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppButton } from "../contact/whatsapp";

const fieldClass = "h-14 rounded-xl border-border bg-background px-4 text-base";

function Field({ id, label, required, error, className = "", children }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor={id} className="text-[15px] font-normal text-foreground/80">
        {label} {required && <span aria-hidden="true">*</span>}
      </Label>
      {children}
      {error && (
        <small id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </small>
      )}
    </div>
  );
}

// Presentational card only — state, validation and submit live in ContactExperience.
export function ContactFormCard({
  uid,
  formId = "enquiry",
  TitleTag = "h2",
  eyebrow,
  heading,
  contextLabel,
  requirementHint,
  rows = 4,
  fields,
  nameInvalid,
  phoneInvalid,
  previewed,
  onChange,
  onSubmit,
}) {
  const t = useTranslations();
  const titleId = `${uid}-title`;

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={titleId}
      className="w-full overflow-hidden rounded-3xl bg-primary p-2.5 text-primary-foreground shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <div>
          {eyebrow && <span className="mb-1 block text-xs opacity-70">{eyebrow}</span>}
          <TitleTag id={titleId} className="!m-0 !text-xl !font-medium !leading-snug !text-primary-foreground sm:!text-2xl">
            {heading}
          </TitleTag>
        </div>
               {contextLabel && (
          <p className="!mb-0 !mt-2 !text-sm !text-muted-foreground/80">{contextLabel}</p>
        )}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <path d="m22 2-7 20-4-9-9-4 20-7Z" />
          <path d="M22 2 11 13" />
        </svg>
      </div>

      {/* Body */}
      <div className="rounded-2xl bg-background p-6 text-foreground sm:p-10">
        <p className="!m-0 max-w-[52ch] !text-base !leading-relaxed !text-muted-foreground">
          {t("contact.intro")}
        </p>
 

        <div className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
          <Field id={`${uid}-name`} label={t("contact.name")} required error={nameInvalid ? t("contact.nameError") : null}>
            <Input
              id={`${uid}-name`}
              name="name"
              autoComplete="name"
              required
              value={fields.name}
              onChange={onChange("name")}
              aria-invalid={nameInvalid}
              aria-describedby={nameInvalid ? `${uid}-name-error` : undefined}
              className={fieldClass}
            />
          </Field>

          <Field id={`${uid}-phone`} label={t("contact.phone")} required error={phoneInvalid ? t("contact.phoneError") : null}>
            <Input
              id={`${uid}-phone`}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              placeholder="+91"
              value={fields.phone}
              onChange={onChange("phone")}
              aria-invalid={phoneInvalid}
              aria-describedby={phoneInvalid ? `${uid}-phone-error` : undefined}
              className={fieldClass}
            />
          </Field>

          <Field id={`${uid}-location`} label={t("contact.location")} className="sm:col-span-2">
            <Input
              id={`${uid}-location`}
              name="location"
              autoComplete="address-level2"
              value={fields.location}
              onChange={onChange("location")}
              className={fieldClass}
            />
          </Field>

          <Field id={`${uid}-requirement`} label={t("contact.requirement")} className="sm:col-span-2">
            <Textarea
              id={`${uid}-requirement`}
              name="requirement"
              rows={rows}
              aria-describedby={requirementHint ? `${uid}-requirement-hint` : undefined}
              value={fields.requirement}
              onChange={onChange("requirement")}
              className="min-h-32 resize-y rounded-xl border-border bg-background p-4 text-base"
            />
            {requirementHint && (
              <small id={`${uid}-requirement-hint`} className="text-sm text-muted-foreground">
                {requirementHint}
              </small>
            )}
          </Field>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="brand" type="submit" className="h-14 rounded-full px-9 text-base font-semibold">
            {t("contact.submit")}
            <span aria-hidden="true" className="ml-2">↗</span>
          </Button>

          <a
            href={PHONE_HREF}
            className="inline-flex items-center gap-3 text-base font-medium !text-foreground hover:!text-primary"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
            </svg>
            {PHONE_LABEL}
          </a>
        </div>

        <div className="mt-6">
          <WhatsAppButton />
        </div>

        <p className="!mb-0 !mt-6 !text-sm !text-muted-foreground">{t("contact.demoNote")}</p>
        {previewed && (
          <p role="status" className="!mb-0 !mt-3 rounded-lg bg-primary/10 px-4 py-3 !text-sm font-medium !text-primary">
            {t("contact.previewDone")}
          </p>
        )}
      </div>
    </form>
  );
}