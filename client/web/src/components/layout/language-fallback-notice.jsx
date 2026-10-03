"use client";

import { useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";

// Shown on an English page reached from a Hindi link when the Hindi version
// doesn't exist yet (?language=hi-unavailable).
export function LanguageFallbackNotice() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  if (searchParams.get("language") !== "hi-unavailable") return null;
  return (
    <div className="language-fallback" role="status" lang="hi">
      {t("language.fallbackNotice")}
    </div>
  );
}
