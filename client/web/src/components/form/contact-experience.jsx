"use client";

import { useEffect, useId, useState } from "react";
import { Clock, Mail, Phone, Send } from "lucide-react";

import { useTranslations } from "next-intl";
import { validContactName, validIndianPhone } from "@/lib/contact-validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppButton } from "../contact/whatsapp";
import { EMAIL, PHONE_LABEL, PHONE_HREF } from "@/lib/site";

// Shared Tailwind classes for the "section" variant fields

const LABEL = "text-[13px] font-medium text-[#09263e]";
const ERROR = "text-xs text-red-600";




const FIELD =
  "!block !h-14 !w-full !rounded-2xl !border !border-solid !border-slate-300 !bg-white !px-5 !text-[15px] !text-[#09263e] !shadow-none placeholder:!text-slate-400 focus-visible:!border-[#1f5d57] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/25";

const AREA =
  "!block !w-full !resize-none !rounded-2xl !border !border-solid !border-slate-300 !bg-white !px-5 !py-4 !text-[15px] !text-[#09263e] !shadow-none focus-visible:!border-[#1f5d57] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/25";


// Contextual expert-callback form
export function ContactExperience({
  pageTitle,
  pageId,
  variant = "rail",
  requirementHint,
  heading,
  eyebrow,
  description,
}) {
  const t = useTranslations();
  const uid = useId();

  const [fields, setFields] = useState({
    name: "",
    phone: "",
    location: "",
    requirement: "",
    subject: "",
  });

  const [attempted, setAttempted] = useState(false);
  const [previewed, setPreviewed] = useState(false);
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

  const nameInvalid =
    attempted && !validContactName(fields.name);

  const phoneInvalid =
    attempted && !validIndianPhone(fields.phone);

  const update = (key) => (event) => {
    setFields({
      ...fields,
      [key]: event.target.value,
    });

    setPreviewed(false);
  };

  const submit = (event) => {
    event.preventDefault();

    setAttempted(true);

    if (
      !validContactName(fields.name) ||
      !validIndianPhone(fields.phone)
    ) {
      const key = !validContactName(fields.name)
        ? "name"
        : "phone";

      event.currentTarget
        .querySelector(`[name="${key}"]`)
        ?.focus();

      return;
    }

    setPreviewed(true);
  };

  const TitleTag = modal ? DialogTitle : "h2";

  const form = (
    <form
      id="enquiry"
      className="callback-form"
      onSubmit={submit}
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

      <div className="contact-field">
        <Label htmlFor={`${uid}-name`}>
          {t("contact.name")}{" "}
          <span aria-hidden="true">*</span>
        </Label>

        <Input
          id={`${uid}-name`}
          name="name"
          autoComplete="name"
          required
          value={fields.name}
          onChange={update("name")}
          aria-invalid={nameInvalid}
          aria-describedby={
            nameInvalid
              ? `${uid}-name-error`
              : undefined
          }
        />

        {nameInvalid && (
          <small
            id={`${uid}-name-error`}
            className="field-error"
          >
            {t("contact.nameError")}
          </small>
        )}
      </div>

      <div className="contact-field">
        <Label htmlFor={`${uid}-phone`}>
          {t("contact.phone")}{" "}
          <span aria-hidden="true">*</span>
        </Label>

        <Input
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="+91"
          value={fields.phone}
          onChange={update("phone")}
          aria-invalid={phoneInvalid}
          aria-describedby={
            phoneInvalid
              ? `${uid}-phone-error`
              : undefined
          }
        />

        {phoneInvalid && (
          <small
            id={`${uid}-phone-error`}
            className="field-error"
          >
            {t("contact.phoneError")}
          </small>
        )}
      </div>

      <div className="contact-field">
        <Label htmlFor={`${uid}-location`}>
          {t("contact.location")}
        </Label>

        <Input
          id={`${uid}-location`}
          name="location"
          autoComplete="address-level2"
          value={fields.location}
          onChange={update("location")}
        />
      </div>

      <div className="contact-field">
        <Label htmlFor={`${uid}-requirement`}>
          {t("contact.requirement")}
        </Label>

        <Textarea
          id={`${uid}-requirement`}
          name="requirement"
          rows={variant === "rail" ? 2 : 3}
          aria-describedby={
            requirementHint
              ? `${uid}-requirement-hint`
              : undefined
          }
          value={fields.requirement}
          onChange={update("requirement")}
        />

        {requirementHint && (
          <small
            id={`${uid}-requirement-hint`}
            className="contact-demo-note"
          >
            {requirementHint}
          </small>
        )}
      </div>

      <Button
        variant="brand"
        className="callback-submit"
        type="submit"
      >
        {t("contact.submit")}
        <span aria-hidden="true">↗</span>
      </Button>

      <WhatsAppButton />

      <p className="contact-demo-note">
        {t("contact.demoNote")}
      </p>

      {previewed && (
        <p
          className="contact-status"
          role="status"
        >
          {t("contact.previewDone")}
        </p>
      )}
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
              onSubmit={submit}
              noValidate
              className="grid gap-4"
            >
              {/* Row 1: Name + Phone */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={`${uid}-s-name`}
                    className={LABEL}
                  >
                    {t("contact.name")}{" "}
                    <span aria-hidden="true">*</span>
                  </Label>

                  <Input
                    id={`${uid}-s-name`}
                    name="name"
                    autoComplete="name"
                    required
                    value={fields.name}
                    onChange={update("name")}
                    aria-invalid={nameInvalid}
                    className={FIELD}
                  />

                  {nameInvalid && (
                    <small className={ERROR}>
                      {t("contact.nameError")}
                    </small>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={`${uid}-s-phone`}
                    className={LABEL}
                  >
                    {t("contact.phone")}{" "}
                    <span aria-hidden="true">*</span>
                  </Label>

                  <Input
                    id={`${uid}-s-phone`}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="+91"
                    value={fields.phone}
                    onChange={update("phone")}
                    aria-invalid={phoneInvalid}
                    className={FIELD}
                  />

                  {phoneInvalid && (
                    <small className={ERROR}>
                      {t("contact.phoneError")}
                    </small>
                  )}
                </div>
              </div>

              {/* Row 2: Location + Subject */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={`${uid}-s-location`}
                    className={LABEL}
                  >
                    {t("contact.location")}
                  </Label>

                  <Input
                    id={`${uid}-s-location`}
                    name="location"
                    autoComplete="address-level2"
                    value={fields.location}
                    onChange={update("location")}
                    className={FIELD}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={`${uid}-s-subject`}
                    className={LABEL}
                  >
                    Subject
                  </Label>

                  <Input
                    id={`${uid}-s-subject`}
                    name="subject"
                    value={fields.subject || ""}
                    onChange={update("subject")}
                    className={FIELD}
                  />
                </div>
              </div>

              {/* Row 3: Message */}

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={`${uid}-s-req`}
                  className={LABEL}
                >
                  Message
                </Label>

                <Textarea
                  id={`${uid}-s-req`}
                  name="requirement"
                  rows={4}
                  value={fields.requirement}
                  onChange={update("requirement")}
                  aria-describedby={
                    requirementHint
                      ? `${uid}-s-hint`
                      : undefined
                  }
                  className={AREA}
                />

                {requirementHint && (
                  <small
                    id={`${uid}-s-hint`}
                    className="text-xs text-slate-500"
                  >
                    {requirementHint}
                  </small>
                )}
              </div>

              {/* Footer */}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                <Button
                  type="submit"
                  className="h-14 rounded-full bg-[#1f5d57] px-10 text-base font-medium text-white! shadow-none transition-colors hover:bg-[#09263e]"
                >
                  Send Message
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

              {previewed && (
                <p
                  className="text-sm text-green-700"
                  role="status"
                >
                  {t("contact.previewDone")}
                </p>
              )}

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