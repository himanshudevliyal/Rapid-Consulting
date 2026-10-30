"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { HoneypotField } from "@/components/form/form-field";
import { useSubmitEnquiry } from "@/hooks/use-enquiry";
import { validIndianPhone } from "@/lib/contact-validation";
import { WHATSAPP_NUMBER } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The one enquiry card used by every Figma page (rails, hero cards, the closing panel).
 * It posts to the existing POST /enquiries hook (useSubmitEnquiry); consent starts
 * unticked and is recorded as text in `requirement`; success shows only when the API accepted.
 *
 *   <FigmaEnquiryCard
 *     title="Check AIF for your project."  hint="..."  seal="free" | "none"
 *     source="scheme-aif" pageId="D011" serviceName="AIF"
 *     select={{ label: "Where is your project?", required: true, options: ["Haryana","Another state","Not sure yet"], placeholder: "Choose" }}
 *     fields={["district","site","activity"]}   // any of: district, site, activity  (name + mobile are always shown)
 *     labels={{ site: "Village / khasra", activity: "What do you want to build?" }}
 *     submitLabel="Check my land for CLU"  helper="A Rapid expert will call to understand your plot."
 *     whatsapp                                  // adds the outline WhatsApp button
 *     tone="white" | "bare"                     // bare = no outer card (inside another card)
 *   />
 * All visible strings are props: callers pass translated text. Missing strings fall back to
 * the shared contact.* keys or sensible English.
 *
 * Wording from a managed page (admin panel) is passed through the same props, all optional:
 *   sealLabel     badge text; a slash starts the second line ("FREE / FIRST REVIEW")
 *   placeholders  { name, phone, district, site, activity }  (phone defaults to "+91")
 *   labels        { name, phone, district, site, activity, optional, required, consent,
 *                   consentHelp, sentTitle, another, sending, choiceError }
 *   select        { label, placeholder, options[], required, defaultValue, placeholderValue }
 *                 (placeholderValue: the first line, e.g. "Not sure yet", is itself an answer)
 *   successText   headline of the "request received" state (same as labels.sentTitle)
 *   submitLabel / helper / whatsappLabel
 */

const FIELD =
  "block h-9 w-full rounded-[10px] border border-slate-300 bg-white px-3.5 text-sm text-[#09263e] placeholder:text-slate-400 focus-visible:border-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]/25 aria-[invalid=true]:border-red-600";

const clean = (value) => (value ?? "").trim() || undefined;

// A field: the label on the left, a small "Required" / "Optional" tag on the right (Figma).
const cap = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

function Row({ id, label, required, requiredLabel, optional, error, children }) {
  const tag = required ? cap(requiredLabel || "Required") : cap(optional);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} title={label} className="min-w-0 truncate whitespace-nowrap text-[12.5px] font-semibold leading-tight text-[#09263e]">
          {label}
        </label>
        {tag && <span className="shrink-0 whitespace-nowrap text-[11.5px] leading-tight text-slate-500">{tag}</span>}
      </div>
      {children}
      {error && (
        <small id={`${id}-error`} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </small>
      )}
    </div>
  );
}

const RIBBON_TEXT = /^\s*free\s*\/?\s*first\s*review\s*$/i;

export function FreeSeal({ label }) {
  // The Figma ribbon artwork says "FREE / FIRST REVIEW". It is used when the label is that text
  // (or empty). Any other wording ("FREE / 48-HOUR LAND CHECK") is drawn as the same ribbon in CSS.
  const text = String(label || "").trim();
  if (!text || RIBBON_TEXT.test(text)) {
    return (
      <img
        data-component="FreeSeal"
        src="/assets/brand/free-first-review.png"
        width={560}
        height={414}
        alt="Free first review"
        decoding="async"
        className="-mt-1 block h-auto w-[84px] shrink-0 select-none drop-shadow-sm sm:w-[92px]"
      />
    );
  }
  // A slash starts the second line of the ribbon.
  const parts = text.split("/").map((part) => part.trim()).filter(Boolean);
  return (
    <span data-component="FreeSeal" className="r3-free-ribbon">
      {parts.map((line, index) => (
        <span key={index} className={index === 0 ? "r3-free-ribbon__main" : "r3-free-ribbon__sub"}>
          {line}
        </span>
      ))}
    </span>
  );
}

export function FigmaEnquiryCard({
  title,
  hint,
  eyebrow,
  seal = "free",
  sealLabel,
  source = "figma-page",
  pageId,
  pageTitle,
  serviceName,
  select,
  fields = ["district", "activity"],
  labels = {},
  placeholders = {},
  successText,
  submitLabel,
  helper,
  whatsapp = true,
  whatsappLabel,
  tone = "white",
  id: domId,
  className,
}) {
  const t = useTranslations();
  const uid = useId();
  const mutation = useSubmitEnquiry();
  const tooLong = t("contact.tooLong");

  const schema = z.object({
    name: z.string().trim().min(1, t("contact.nameError")).max(120, tooLong),
    phone: z.string().trim().refine((value) => validIndianPhone(value), t("contact.phoneError")).refine((v) => v.length <= 20, tooLong),
    choice: select?.required ? z.string().trim().min(1, labels.choiceError || "Please choose one") : z.string().optional(),
    district: z.string().trim().max(80, tooLong),
    site: z.string().trim().max(110, tooLong),
    activity: z.string().trim().max(400, tooLong),
    consent: z.boolean().refine((value) => value === true, labels.consentHelp || "Please tick the box so we can contact you."),
    website: z.string().optional(),
  });
  const DEFAULTS = { name: "", phone: "", choice: select?.defaultValue || "", district: "", site: "", activity: "", consent: false, website: "" };
  const { register, handleSubmit, reset, setFocus, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });
  const consent = watch("consent");
  const pending = mutation.isPending;
  const id = (name) => `${uid}-${name}`;
  const invalid = (e) => {
    const first = ["name", "phone", "choice", "district", "site", "activity", "consent"].find((k) => e[k]);
    if (first) setFocus(first);
  };

  const submit = (values) => {
    if (pending) return;
    const location = [clean(values.district), clean(values.site)].filter(Boolean).join(", ");
    const requirement = [
      clean(values.choice) && `${select?.label || "Choice"}: ${clean(values.choice)}`,
      clean(values.activity) && `${labels.activity || "Project"}: ${clean(values.activity)}`,
      clean(values.district) && `District: ${clean(values.district)}`,
      clean(values.site) && `${labels.site || "Site"}: ${clean(values.site)}`,
      "Contact consent: the visitor allowed phone or WhatsApp contact about this enquiry.",
    ].filter(Boolean).join("\n");
    mutation.mutate(
      {
        name: clean(values.name),
        phone: clean(values.phone),
        location: location || undefined,
        subject: submitLabel || title,
        requirement,
        service_name: serviceName || submitLabel || title,
        page_title: clean(pageTitle) || clean(document.title),
        page_url: window.location.href,
        page_id: pageId,
        source,
        website: values.website || undefined,
      },
      { onSuccess: () => reset(DEFAULTS) },
    );
  };

  const wa = `https://wa.me/${WHATSAPP_NUMBER}`;
  const shell =
    tone === "bare"
      ? "w-full"
      : "w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-24px_rgba(9,38,62,0.35)] sm:p-5";

  return (
    <div id={domId} data-component="FigmaEnquiryCard" className={cn(shell, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="mb-2! mt-0! text-xs font-bold uppercase tracking-[0.16em] text-[#922e0c]">{eyebrow}</p>}
          <h2 className="m-0! max-w-none! text-[1.0625rem]! font-bold! leading-snug! tracking-tight! text-[#09263e]! sm:text-[1.125rem]!">{title}</h2>
          {hint && <p className="mb-0! mt-2! text-sm leading-6 text-slate-700">{hint}</p>}
        </div>
        {seal === "free" && <FreeSeal label={sealLabel} />}
      </div>

      {mutation.isSuccess ? (
        <div role="status" className="mt-5 rounded-2xl bg-[#eef3f1] p-5">
          <p className="m-0! flex items-center gap-2 text-base font-semibold text-[#09263e]">
            <CheckCircle2 className="size-5 text-[#1f5d57]" aria-hidden="true" />
            {successText || labels.sentTitle || t("contact.sent")}
          </p>
          <button
            type="button"
            onClick={() => {
              mutation.reset();
              requestAnimationFrame(() => requestAnimationFrame(() => setFocus("name")));
            }}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#09263e]/30 px-5 text-sm font-semibold text-[#09263e] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
          >
            {labels.another || "Send another"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit, invalid)} noValidate className="mt-3 grid gap-2.5">
          <HoneypotField register={register} />
          <div className="grid grid-cols-2 gap-2.5">
          <Row id={id("name")} label={labels.name || "Your name"} required requiredLabel={labels.required} error={errors.name?.message}>
            <input id={id("name")} type="text" autoComplete="name" placeholder={placeholders.name || undefined} aria-required="true" aria-invalid={!!errors.name} className={FIELD} {...register("name")} />
          </Row>
          <Row id={id("phone")} label={labels.phone || "Mobile number"} required requiredLabel={labels.required} error={errors.phone?.message}>
            <input id={id("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder={placeholders.phone || "+91"} aria-required="true" aria-invalid={!!errors.phone} className={FIELD} {...register("phone")} />
          </Row>
          </div>
          {select && (
            <Row id={id("choice")} label={select.label} required={select.required} requiredLabel={labels.required} optional={!select.required ? labels.optional || "optional" : undefined} error={errors.choice?.message}>
              <select id={id("choice")} aria-invalid={!!errors.choice} className={FIELD} {...register("choice")}>
                <option value={select.placeholderValue ? select.placeholder || "" : ""}>{select.placeholder || "Choose one"}</option>
                {select.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Row>
          )}
          <div className={cn("grid gap-3", fields.includes("district") && fields.includes("site") && "grid-cols-2")}>
          {fields.includes("district") && (
            <Row id={id("district")} label={labels.district || "District"} optional={labels.optional || "optional"} error={errors.district?.message}>
              <input id={id("district")} type="text" autoComplete="address-level2" placeholder={placeholders.district || undefined} className={FIELD} {...register("district")} />
            </Row>
          )}
          {fields.includes("site") && (
            <Row id={id("site")} label={labels.site || "Village / khasra"} optional={labels.optional || "optional"} error={errors.site?.message}>
              <input id={id("site")} type="text" placeholder={placeholders.site || undefined} className={FIELD} {...register("site")} />
            </Row>
          )}
          </div>
          {fields.includes("activity") && (
            <Row id={id("activity")} label={labels.activity || "What are you working on?"} optional={labels.optional || "optional"} error={errors.activity?.message}>
              <input id={id("activity")} type="text" placeholder={placeholders.activity || undefined} className={FIELD} {...register("activity")} />
            </Row>
          )}
          <div className="flex items-start gap-3">
            <input id={id("consent")} type="checkbox" aria-invalid={!!errors.consent} className="mt-0.5 size-4 shrink-0 rounded border-slate-400 accent-[#09263e]" {...register("consent")} />
            <label htmlFor={id("consent")} className="text-[12px] leading-[1.45] text-slate-700">
              {labels.consent || "I agree that Rapid may call or WhatsApp me about this enquiry."}
            </label>
          </div>
          {errors.consent && (
            <p role="alert" className="m-0! text-xs font-medium text-red-700">{errors.consent.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className={cn(
              "inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2 text-[13.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2",
              consent ? "bg-[#eaff6b] text-[#09263e] hover:bg-[#dcf24f]" : "cursor-not-allowed bg-[#eaff6b]/45 text-[#09263e]/60",
            )}
          >
            {pending ? labels.sending || t("contact.sending") : submitLabel || "Get my next steps"}
            {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
          </button>
          {helper && <p className="m-0! text-xs leading-5 text-slate-600">{helper}</p>}
          {mutation.isError && (
            <p role="alert" className="m-0! rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{t("contact.sendError")}</p>
          )}
          {whatsapp && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-[#09263e]/60 px-5 text-[13.5px] font-semibold text-[#09263e]! no-underline hover:bg-[#eef3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
            >
              <MessageCircle className="size-4 text-[#128c4a]" aria-hidden="true" />
              {whatsappLabel || "Chat with Rapid on WhatsApp"}
            </a>
          )}
        </form>
      )}
    </div>
  );
}

export default FigmaEnquiryCard;
