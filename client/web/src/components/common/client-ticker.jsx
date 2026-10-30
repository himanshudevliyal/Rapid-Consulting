"use client";

import { useTranslations } from "next-intl";

import { LogoStrip } from "@/home/logo-strip";
import { useTx } from "@/lib/use-tx";

// "Our clients": the same logo strip as the Home page (home/logo-strip.jsx), so every
// client section on the site looks the same.
export function ClientTicker() {
  const t = useTranslations();
  const tx = useTx();

  return (
    <LogoStrip
      eyebrow={t("clients.title")}
      title={tx("homeA.logos.title", "Businesses that trust Rapid")}
    />
  );
}
