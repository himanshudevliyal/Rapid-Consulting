"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { WhatsAppMark } from "@/components/contact/whatsapp";

export function ShareActions({ title }) {
  const t = useTranslations();
  const [url, setUrl] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  const share = (network) => {
    const current = window.location.href;
    setUrl(current);
    const href =
      network === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(`${title}\n${current}`)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(current)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    const current = window.location.href;
    setUrl(current);
    try {
      await navigator.clipboard.writeText(current);
      setCopied(true);
      setFeedback(t("share.copied"));
    } catch {
      setCopied(false);
      setFeedback(t("share.copyFailed"));
    }
  };

  return (
    <div className="share-actions" aria-label={t("share.label")}>
      <button type="button" onClick={() => share("whatsapp")} aria-label={t("share.whatsapp")} title="WhatsApp">
        <WhatsAppMark />
      </button>
      <button type="button" onClick={() => share("linkedin")} aria-label={t("share.linkedin")} title="LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm6 0h4v1.6c.6-1.1 1.9-1.9 3.5-1.9 3.4 0 4.5 2.1 4.5 5.5V21h-4v-6c0-1.8-.3-3-1.8-3-1.6 0-2.2 1-2.2 3v6H9V9Z" />
        </svg>
      </button>
      <button type="button" onClick={copy} aria-label={t("share.copy")} title={t("share.copyTitle")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path
            d="m9 15 6-6M8 17l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 7l1-1a4 4 0 1 1 6 6l-4 4a4 4 0 0 1-6 0"
            transform="translate(1 0) scale(.9 1)"
          />
        </svg>
      </button>
      <span role="status" className="share-feedback">
        {feedback}
      </span>
      {feedback && !copied && (
        <input className="share-fallback" readOnly value={url} aria-label={t("share.pageLink")} onFocus={(e) => e.target.select()} />
      )}
    </div>
  );
}
