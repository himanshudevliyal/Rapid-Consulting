"use client";

import { useTranslations } from "next-intl";

// Translator with a built-in English fallback for keys that are still waiting
// to be merged into messages/en.json (see messages/_additions/*.json).
//   const tx = useTx();  tx("header.nav.subsidies", "Subsidies & Incentives")
export function useTx() {
  const t = useTranslations();
  return (key, fallback, values) => (t.has(key) ? t(key, values) : fallback);
}
