"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { validContactName, validIndianPhone } from "@/lib/contact-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Offline chat preview. No provider or live agent is connected yet.
export function ChatWidget() {
  const t = useTranslations();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [identified, setIdentified] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [preview, setPreview] = useState(false);
  const panel = useRef(null);
  const toggle = useRef(null);

  useEffect(() => {
    if (open) panel.current?.querySelector("input,textarea")?.focus();
  }, [open, identified]);

  const close = () => {
    setOpen(false);
    toggle.current?.focus();
  };
  const nameInvalid = attempted && !validContactName(name);
  const phoneInvalid = attempted && !validIndianPhone(phone);

  return (
    <div className="chat-widget">
      {open && (
        <section
          ref={panel}
          className="chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${uid}-heading`}
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <button type="button" className="contact-close" onClick={close} aria-label={t("chat.close")}>
            ×
          </button>
          <span className="eyebrow">{t("chat.eyebrow")}</span>
          <h2 id={`${uid}-heading`}>{t("chat.heading")}</h2>
          <p className="contact-demo-note">{t("chat.demoNote")}</p>
          {!identified ? (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                setAttempted(true);
                if (validContactName(name) && validIndianPhone(phone)) setIdentified(true);
                else e.currentTarget.querySelector(!validContactName(name) ? '[name="chat-name"]' : '[name="chat-phone"]')?.focus();
              }}
            >
              <div className="contact-field">
                <Label htmlFor={`${uid}-name`}>{t("chat.name")} *</Label>
                <Input
                  id={`${uid}-name`}
                  name="chat-name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={nameInvalid}
                  aria-describedby={nameInvalid ? `${uid}-name-error` : undefined}
                />
                {nameInvalid && (
                  <small className="field-error" id={`${uid}-name-error`}>
                    {t("chat.nameError")}
                  </small>
                )}
              </div>
              <div className="contact-field">
                <Label htmlFor={`${uid}-phone`}>{t("chat.phone")} *</Label>
                <Input
                  id={`${uid}-phone`}
                  name="chat-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={phoneInvalid}
                  aria-describedby={phoneInvalid ? `${uid}-phone-error` : undefined}
                />
                {phoneInvalid && (
                  <small className="field-error" id={`${uid}-phone-error`}>
                    {t("chat.phoneError")}
                  </small>
                )}
              </div>
              <Button variant="brand" type="submit">
                {t("chat.continue")}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) setPreview(true);
              }}
            >
              <div className="contact-field">
                <Label htmlFor={`${uid}-message`}>{t("chat.message")}</Label>
                <Textarea
                  id={`${uid}-message`}
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setPreview(false);
                  }}
                />
              </div>
              <Button variant="brand" type="submit">
                {t("chat.previewMessage")}
              </Button>
              <button type="button" className="chat-edit" onClick={() => setIdentified(false)}>
                {t("chat.editDetails")}
              </button>
              {preview && (
                <p role="status" className="contact-status">
                  {t("chat.previewReady")}
                </p>
              )}
            </form>
          )}
        </section>
      )}
      <button ref={toggle} type="button" className="chat-toggle" onClick={() => setOpen(!open)} aria-label={t("chat.open")} aria-expanded={open}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 4h16v12H9l-5 4V4Z" />
          <path d="M8 8h8M8 12h5" />
        </svg>
        <span>{t("chat.toggle")}</span>
      </button>
    </div>
  );
}
