"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { TabList, panelId, tabId } from "@/components/common/tab-list";
import { ProofSeal } from "@/components/home/proof-seal";
import { HoneypotField } from "@/components/form/form-field";
import { useSubmitEnquiry } from "@/hooks/use-enquiry";
import { validIndianPhone } from "@/lib/contact-validation";
import { cn } from "@/lib/utils";

// The Home hero enquiry card. It posts to the same API the callback rail and the
// enquiry drawer use (POST /enquiries through useSubmitEnquiry), so there is no
// new endpoint. The two tabs are two form identities: they change the `source`
// ("home-hero-approval" / "home-hero-subsidy"), the `subject` and the
// `service_name` of the request, which is how the team sees which check was asked
// for. Consent starts unticked and is a precondition of submitting. Success is
// shown only when the API accepted the request.

const IDENTITIES = { approval: "approval", subsidy: "subsidy" };

const field =
  "block h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-[#09263e] placeholder:text-slate-400 focus-visible:border-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]/25 aria-[invalid=true]:border-red-600";

const DEFAULTS = { name: "", phone: "", district: "", site: "", activity: "", consent: false, website: "" };

const clean = (value) => (value ?? "").trim() || undefined;

function Row({ id, label, required, requiredLabel, optional, hint, error, children, className }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-[#09263e]">
        {label}
        {required ? (
          requiredLabel ? (
            <span className="font-normal text-slate-600"> ({requiredLabel})</span>
          ) : (
            <span aria-hidden="true"> *</span>
          )
        ) : (
          optional && <span className="font-normal text-slate-600"> ({optional})</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <small id={`${id}-hint`} className="text-xs text-slate-600">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </small>
      )}
    </div>
  );
}

export function HeroEnquiryCard({ copy, seal, pageTitle, pageId = "H01" }) {
  const t = useTranslations();
  const uid = useId();
  const [tab, setTab] = useState(IDENTITIES.approval);
  const mutation = useSubmitEnquiry();

  const tooLong = t("contact.tooLong");
  const schema = z.object({
    name: z.string().trim().min(1, t("contact.nameError")).max(120, tooLong),
    phone: z
      .string()
      .trim()
      .refine((value) => validIndianPhone(value), t("contact.phoneError"))
      .refine((value) => value.length <= 20, tooLong),
    district: z.string().trim().max(80, tooLong),
    site: z.string().trim().max(110, tooLong),
    activity: z.string().trim().max(400, tooLong),
    consent: z.boolean().refine((value) => value === true, copy.consentHelp),
    website: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: DEFAULTS });

  const consent = watch("consent");
  const label = tab === IDENTITIES.subsidy ? copy.tabSubsidy : copy.tabApproval;
  const submitLabel = tab === IDENTITIES.subsidy ? copy.submitSubsidy : copy.submitApproval;
  const pending = mutation.isPending;
  const hasFieldErrors = Object.keys(errors).length > 0;

  const submit = (values) => {
    if (pending) return;
    const location = [clean(values.district), clean(values.site)].filter(Boolean).join(", ");
    const requirement = [
      clean(values.activity) && `Proposed business activity: ${clean(values.activity)}`,
      clean(values.district) && `District: ${clean(values.district)}`,
      clean(values.site) && `Site location / village: ${clean(values.site)}`,
      "Contact consent: the visitor allowed phone or WhatsApp contact about this enquiry.",
    ]
      .filter(Boolean)
      .join("\n");

    mutation.mutate(
      {
        name: clean(values.name),
        phone: clean(values.phone),
        location: location || undefined,
        subject: label,
        requirement,
        service_name: label,
        page_title: clean(pageTitle) || clean(document.title),
        page_url: window.location.href,
        page_id: pageId,
        source: `home-hero-${tab}`,
        website: values.website || undefined,
      },
      {
        onSuccess: () => reset(DEFAULTS),
        onError: (error) => {
          // The API names the fields it rejected: show each under its own input.
          const names = { location: "site", requirement: "activity" };
          const fieldErrors = error?.response?.data?.errors;
          if (fieldErrors && typeof fieldErrors === "object") {
            Object.entries(fieldErrors).forEach(([name, message], index) =>
              setError(names[name] ?? name, { type: "server", message: String(message) }, { shouldFocus: index === 0 }),
            );
          }
        },
      },
    );
  };

  // First invalid field, in form order.
  const invalid = (formErrors) => {
    const first = ["name", "phone", "district", "site", "activity", "consent"].find((key) => formErrors[key]);
    if (first) setFocus(first);
  };

  const id = (name) => `${uid}-${name}`;
  const describe = (name, hint) =>
    [errors[name] && `${id(name)}-error`, hint && !errors[name] && `${id(name)}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div
      id="hero-form"
      data-component="HeroEnquiryCard"
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-24px_rgba(9,38,62,0.35)] sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2! mt-0! text-xs font-bold uppercase tracking-[0.16em] text-[#922e0c]">{copy.eyebrow}</p>
          <h2 className="m-0! max-w-none! text-[1.375rem]! font-semibold! leading-tight! tracking-tight! text-[#09263e]! sm:text-2xl!">
            {copy.title}
          </h2>
          <p className="mb-0! mt-2! text-sm leading-6 text-slate-700">{copy.hint}</p>
        </div>
        <ProofSeal value={seal.value} label={seal.label} ariaLabel={seal.aria} />
      </div>

      {mutation.isSuccess ? (
        <div role="status" className="mt-6 rounded-2xl bg-[#eef3f1] p-5">
          <p className="m-0! flex items-center gap-2 text-base font-semibold text-[#09263e]">
            <CheckCircle2 className="size-5 text-[#1f5d57]" aria-hidden="true" />
            {copy.sentTitle}
          </p>
          <p className="mb-0! mt-2! text-sm leading-6 text-slate-700">{t("contact.sent")}</p>
          <button
            type="button"
            onClick={() => {
              mutation.reset();
              // The form comes back: put the cursor in its first field.
              requestAnimationFrame(() => requestAnimationFrame(() => setFocus("name")));
            }}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#09263e]/30 px-5 text-sm font-semibold text-[#09263e] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
          >
            {copy.another}
          </button>
        </div>
      ) : (
        <>
          <TabList
            tabs={[
              { id: IDENTITIES.approval, label: copy.tabApproval },
              { id: IDENTITIES.subsidy, label: copy.tabSubsidy },
            ]}
            value={tab}
            onChange={setTab}
            label={copy.tabsLabel}
            idPrefix={uid}
            className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-[#eef3f1] p-1"
            tabClassName="justify-center rounded-full border-0 px-3 text-sm"
            selectedClassName="bg-[#09263e] text-white shadow-sm"
            idleClassName="bg-transparent text-[#09263e] hover:bg-white"
          />

          <div role="tabpanel" id={panelId(uid)} aria-labelledby={tabId(uid, tab)}>
          <form onSubmit={handleSubmit(submit, invalid)} noValidate className="mt-5 grid gap-4">
            <HoneypotField register={register} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Row id={id("name")} label={copy.name} required requiredLabel={copy.required} error={errors.name?.message}>
                <input
                  id={id("name")}
                  type="text"
                  autoComplete="name"
                  placeholder={copy.namePlaceholder || undefined}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={describe("name")}
                  className={field}
                  {...register("name")}
                />
              </Row>
              <Row
                id={id("phone")}
                label={copy.phone}
                required
                requiredLabel={copy.required}
                error={errors.phone?.message}
              >
                <input
                  id={id("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={copy.phonePlaceholder || "+91"}
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={describe("phone")}
                  className={field}
                  {...register("phone")}
                />
              </Row>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Row id={id("district")} label={copy.district} optional={copy.optional} error={errors.district?.message}>
                <input
                  id={id("district")}
                  type="text"
                  autoComplete="address-level2"
                  placeholder={copy.districtPlaceholder}
                  aria-invalid={!!errors.district}
                  aria-describedby={describe("district")}
                  className={field}
                  {...register("district")}
                />
              </Row>
              <Row id={id("site")} label={copy.site} optional={copy.optional} error={errors.site?.message}>
                <input
                  id={id("site")}
                  type="text"
                  placeholder={copy.sitePlaceholder || undefined}
                  aria-invalid={!!errors.site}
                  aria-describedby={describe("site")}
                  className={field}
                  {...register("site")}
                />
              </Row>
            </div>

            <Row id={id("activity")} label={copy.activity} optional={copy.optional} error={errors.activity?.message}>
              <input
                id={id("activity")}
                type="text"
                placeholder={copy.activityPlaceholder}
                aria-invalid={!!errors.activity}
                aria-describedby={describe("activity")}
                className={field}
                {...register("activity")}
              />
            </Row>

            {/* Consent starts unticked. */}
            <div className="flex items-start gap-3">
              <input
                id={id("consent")}
                type="checkbox"
                aria-invalid={!!errors.consent}
                aria-describedby={`${id("consent")}-help`}
                className="mt-1 size-5 shrink-0 rounded border-slate-400 accent-[#09263e]"
                {...register("consent")}
              />
              <label htmlFor={id("consent")} className="text-sm leading-6 text-slate-800">
                {copy.consent}
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={pending}
                aria-disabled={!consent || pending ? "true" : undefined}
                aria-busy={pending}
                aria-describedby={`${id("consent")}-help`}
                className={cn(
                  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-2 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2",
                  consent
                    ? "bg-[#eaff6b] text-[#09263e] hover:bg-[#dcf24f]"
                    : "cursor-not-allowed bg-[#eaff6b]/45 text-[#09263e]/60",
                )}
              >
                {pending ? copy.sending : submitLabel}
                {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
              </button>
              {(!consent || errors.consent) && (
                <p
                  id={`${id("consent")}-help`}
                  role={errors.consent ? "alert" : undefined}
                  className={cn("mb-0! mt-2! text-xs leading-5", errors.consent ? "font-medium text-red-700" : "text-slate-700")}
                >
                  {copy.consentHelp}
                </p>
              )}
              {consent && !errors.consent && <span id={`${id("consent")}-help`} className="sr-only" />}
            </div>

            {mutation.isError && !hasFieldErrors && (
              <p role="alert" className="m-0! rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
                {t("contact.sendError")}
              </p>
            )}
          </form>
          </div>
        </>
      )}
    </div>
  );
}

export default HeroEnquiryCard;
