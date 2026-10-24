"use client";

import { useEffect, useId, useState } from "react";
import { Clock, Mail, Phone, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useTranslations } from "next-intl";
import {
  CONTACT_DEFAULTS,
  createContactSchema,
  createEnquirySchema,
  ENQUIRY_DEFAULTS,
} from "@/lib/enquiry-schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { WhatsAppButton } from "../contact/whatsapp";
import { FormStatus, HoneypotField, TextAreaField, TextField } from "./form-field";
import { useSubmitContactEnquiry, useSubmitEnquiry } from "@/hooks/use-enquiry";
import { EMAIL, PHONE_LABEL, PHONE_HREF } from "@/lib/site";

// Empty text is left out of the request; the API column limits are enforced
// by the validation schema, so nothing is cut silently.
const clean = (value) => (value ?? "").trim() || undefined;

// Contextual expert-callback / contact form (React Hook Form).
//   kind="enquiry" (default) -> POST /enquiries          (service & page enquiries)
//   kind="contact"           -> POST /contact-enquiries  (Contact Us page: also asks email)
// The page title, URL and service name are captured on submit so the admin
// can see where every enquiry came from.
export function ContactExperience({
  pageTitle,
  pageId,
  variant = "rail",
  kind = "enquiry",
  serviceName,
  source,
  requirementHint,
  heading,
  eyebrow,
  description,
}) {
  const t = useTranslations();
  const uid = useId();
  const isContact = kind === "contact";
  // The message box is "message" on the contact form, "requirement" on the enquiry form.
  const messageName = isContact ? "message" : "requirement";

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isContact ? createContactSchema(t) : createEnquirySchema(t)),
    defaultValues: isContact ? CONTACT_DEFAULTS : ENQUIRY_DEFAULTS,
  });

  const enquiryMutation = useSubmitEnquiry();
  const contactMutation = useSubmitContactEnquiry();
  const mutation = isContact ? contactMutation : enquiryMutation;

  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);

  const modal = mobile && variant === "rail";

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");

    const update = () => setMobile(query.matches);

    update();

    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  // On mobile the rail form lives in a dialog
  useEffect(() => {
    if (!modal) return;

    const onHash = () => {
      if (window.location.hash === "/contact") {
        setOpen(true);
      }
    };

    const onAnchor = (event) => {
      const anchor = event.target.closest?.("a[href]");

      if (!anchor) return;

      const url = new URL(
        anchor.getAttribute("href"),
        window.location.href
      );

      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.hash === "/contact"
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };

    onHash();

    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onAnchor);

    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onAnchor);
    };
  }, [modal]);

  // Typing again after a result clears the old "sent" / "failed" message.
  const { isIdle, isPending, reset: resetMutation } = mutation;
  useEffect(() => {
    const subscription = watch((_values, info) => {
      if (info.type === "change" && !isIdle && !isPending) resetMutation();
    });
    return () => subscription.unsubscribe();
  }, [watch, isIdle, isPending, resetMutation]);

  const submit = (values) => {
    if (mutation.isPending) return;

    const payload = {
      name: clean(values.name),
      phone: clean(values.phone),
      location: clean(values.location),
      subject: clean(values.subject),
      [messageName]: clean(values[messageName]),
      // Where the visitor was: captured automatically, nothing to type.
      page_title: clean(pageTitle) || clean(document.title),
      page_url: window.location.href,
      page_id: clean(pageId),
      source: source || (isContact ? "contact-page" : variant === "section" ? "contact-section" : "callback-rail"),
      website: values.website || undefined,
    };
    if (isContact) payload.email = clean(values.email);
    else if (serviceName) payload.service_name = clean(serviceName);

    mutation.mutate(payload, {
      onSuccess: () => reset(),
      onError: (error) => {
        // The API names the fields it rejected: show each under its own input.
        const fieldErrors = error?.response?.data?.errors;
        if (fieldErrors && typeof fieldErrors === "object") {
          Object.entries(fieldErrors).forEach(([field, message], index) =>
            setError(field, { type: "server", message: String(message) }, { shouldFocus: index === 0 }),
          );
        }
      },
    });
  };

  // Focus the first invalid field (the order of the form).
  const invalid = (formErrors) => {
    const order = ["name", "email", "phone", "location", "subject", messageName];
    const first = order.find((key) => formErrors[key]);
    if (first) setFocus(first);
  };

  const pending = mutation.isPending;
  const hasFieldErrors = Object.keys(errors).length > 0;
  const status = (
    <FormStatus
      variant={variant === "section" ? "section" : "rail"}
      success={mutation.isSuccess ? t(isContact ? "contact.contactSent" : "contact.sent") : ""}
      error={mutation.isError && !hasFieldErrors ? t(isContact ? "contact.contactSendError" : "contact.sendError") : ""}
    />
  );

  // The visible fields, shared by the rail and the section layout.
  const fieldProps = (suffix, fieldVariant) => ({ register, variant: fieldVariant, id: `${uid}${suffix}` });
  const emailField = (suffix, fieldVariant) => (
    <TextField
      {...fieldProps(`${suffix}-email`, fieldVariant)}
      name="email"
      type="email"
      inputMode="email"
      autoComplete="email"
      label={t("contact.email")}
      required
      error={errors.email?.message}
    />
  );

  const TitleTag = modal ? DialogTitle : "h2";

  const form = (
    <form
      id="enquiry"
      className="callback-form"
      onSubmit={handleSubmit(submit, invalid)}
      noValidate
      aria-labelledby={`${uid}-title`}
    >
      <span className="eyebrow">
        {eyebrow || t("contact.eyebrow")}
      </span>

      <TitleTag id={`${uid}-title`}>
        {heading || t("contact.heading")}
      </TitleTag>

      <p>{t("contact.intro")}</p>

      <p className="contact-context">
        {pageTitle} <span>· {pageId}</span>
      </p>

      <HoneypotField register={register} />

      <TextField
        {...fieldProps("-name", "rail")}
        name="name"
        autoComplete="name"
        label={t("contact.name")}
        required
        error={errors.name?.message}
      />

      {isContact && emailField("", "rail")}

      <TextField
        {...fieldProps("-phone", "rail")}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+91"
        label={t("contact.phone")}
        required
        error={errors.phone?.message}
      />

      <TextField
        {...fieldProps("-location", "rail")}
        name="location"
        autoComplete="address-level2"
        label={t("contact.location")}
        error={errors.location?.message}
      />

      <TextAreaField
        {...fieldProps("-requirement", "rail")}
        name={messageName}
        rows={variant === "rail" ? 2 : 3}
        label={isContact ? t("contact.message") : t("contact.requirement")}
        required={isContact}
        hint={requirementHint}
        error={errors[messageName]?.message}
      />

      <Button
        variant="brand"
        className="callback-submit"
        type="submit"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? t("contact.sending") : t("contact.submit")}
        {!pending && <span aria-hidden="true">↗</span>}
      </Button>

      <WhatsAppButton />

      <p className="contact-demo-note">
        {t("contact.demoNote")}
      </p>

      {status}
    </form>
  );

  /* ─────────────────────────────────────────────
     Section Variant
     Background Image + Light Overlay
  ───────────────────────────────────────────── */

  if (variant === "section") {
    const info = [
      {
        icon: Mail,
        label: "Email Address",
        value: EMAIL,
        href: `mailto:${EMAIL}`,
      },
      {
        icon: Phone,
        label: "Call Us",
        value: PHONE_LABEL,
        href: PHONE_HREF,
      },
      {
        icon: Clock,
        label: "Working Hours",
        value: "Mon–Sat, 09am–07pm",
      },
    ];

    return (
      <div
        id="enquiry"
        data-component="ContactSection"
        className="
          relative isolate
          grid w-full
          scroll-mt-32
          items-start
          gap-12
          overflow-hidden
          rounded-[2rem]
          bg-cover
          bg-center
          bg-no-repeat
          px-5
          py-10
          lg:grid-cols-2
          lg:gap-16
          lg:px-10
          lg:py-14
        "
        style={{
          backgroundImage:
            "url('/assets/bg-main.png')",
        }}
      >
        {/* Light Background Overlay */}
        <div
          className="absolute inset-0 -z-10 bg-white/80"
          aria-hidden="true"
        />

        {/* ───────── Left: Text + Info ───────── */}

        <div className="flex flex-col">
          <span className="mb-5 w-fit rounded-md bg-[#eaff6b] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#09263e]">
            {eyebrow || t("contact.eyebrow")}
          </span>

          <h2 className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight text-[#071f33] md:text-5xl">
            {heading || "Turning Challenges into Opportunities"}
          </h2>

          {description && (
            <div className="mt-6 max-w-lg text-base leading-8 text-slate-600 [&_p]:m-0 [&_p+p]:mt-3">
              {description}
            </div>
          )}

          <ul className="mt-8 space-y-5">
            {info.map(
              ({
                icon: Icon,
                label,
                value,
                href,
              }) => (
                <li
                  key={label}
                  className="flex items-start gap-4"
                >
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e]">
                    <Icon
                      className="size-[18px]"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {label}
                    </span>

                    {href ? (
                      <a
                        href={href}
                        className="text-[17px] font-medium text-[#09263e] transition-colors hover:text-[#1f5d57]"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-[17px] font-medium text-[#09263e]">
                        {value}
                      </span>
                    )}
                  </div>
                </li>
              )
            )}
          </ul>
        </div>

        {/* ───────── Right: Form ───────── */}

        <div className="rounded-[2rem] bg-[#eaff6b] p-2 shadow-sm sm:p-2.5">
          <div className="flex items-center gap-3 px-4 pb-3.5 pt-3 sm:px-5">
            <Send
              className="size-6 text-[#1f5d57]"
              aria-hidden="true"
            />

            <h3 className="text-xl font-semibold text-[#09263e] sm:text-2xl">
              Let&apos;s Talk – Free Consultation
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-5 sm:p-8">
            <p className="mb-6 text-sm leading-7 text-slate-500">
              Book your free session with our team and
              discover solutions crafted for your business.
            </p>

            <form
              id="enquiry-section"
              onSubmit={handleSubmit(submit, invalid)}
              noValidate
              className="grid gap-4"
            >
              <HoneypotField register={register} />

              {/* Row 1: Name + Phone */}

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  {...fieldProps("-s-name", "section")}
                  name="name"
                  autoComplete="name"
                  label={t("contact.name")}
                  required
                  error={errors.name?.message}
                />

                <TextField
                  {...fieldProps("-s-phone", "section")}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91"
                  label={t("contact.phone")}
                  required
                  error={errors.phone?.message}
                />
              </div>

              {/* Row 2: Email (contact form) + Location */}

              <div className="grid gap-4 sm:grid-cols-2">
                {isContact && emailField("-s", "section")}

                <TextField
                  {...fieldProps("-s-location", "section")}
                  name="location"
                  autoComplete="address-level2"
                  label={t("contact.location")}
                  error={errors.location?.message}
                />

                {!isContact && (
                  <TextField
                    {...fieldProps("-s-subject", "section")}
                    name="subject"
                    label={t("contact.subject")}
                    error={errors.subject?.message}
                  />
                )}
              </div>

              {/* Row 2b: Subject (contact form) */}

              {isContact && (
                <TextField
                  {...fieldProps("-s-subject", "section")}
                  name="subject"
                  label={t("contact.subject")}
                  error={errors.subject?.message}
                />
              )}

              {/* Row 3: Message */}

              <TextAreaField
                {...fieldProps("-s-req", "section")}
                name={messageName}
                rows={4}
                label={t("contact.message")}
                required={isContact}
                hint={requirementHint}
                error={errors[messageName]?.message}
              />

              {/* Footer */}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                <Button
                  type="submit"
                  disabled={pending}
                  aria-busy={pending}
                  className="h-14 rounded-full bg-[#1f5d57] px-10 text-base font-medium text-white! shadow-none transition-colors hover:bg-[#09263e]"
                >
                  {pending ? t("contact.sending") : t("contact.sendMessage")}
                </Button>

                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#09263e] transition-colors hover:text-[#1f5d57]"
                >
                  <Phone
                    className="size-4"
                    aria-hidden="true"
                  />

                  Call : {PHONE_LABEL}
                </a>
              </div>

              {status}

              <p className="text-[11px] text-slate-400">
                {t("contact.demoNote")}
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Rail Variant
  ───────────────────────────────────────────── */

  return (
    <aside
      className={`contact-experience contact-${variant}`}
    >
      {modal ? (
        <Dialog
          open={open}
          onOpenChange={setOpen}
        >
          <DialogContent
            bare
            className="callback-dialog"
            aria-describedby={undefined}
          >
            <DialogClose
              className="contact-close"
              aria-label={t("contact.closeForm")}
            >
              ×
            </DialogClose>

            {form}
          </DialogContent>
        </Dialog>
      ) : (
        form
      )}

      {variant === "rail" && (
        <Button
          variant="brand"
          type="button"
          className="mobile-callback"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          {t("contact.mobileButton")}
          <span aria-hidden="true">↗</span>
        </Button>
      )}
    </aside>
  );
}