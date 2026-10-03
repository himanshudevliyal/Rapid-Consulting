"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/contact/whatsapp";

// Shown when the service API cannot be reached.
export default function ServicesError({ reset }) {
  const t = useTranslations();
  return (
    <main className="container error-page" id="main">
      <p className="eyebrow">Rapid Consulting</p>
      <h1>{t("error.title")}</h1>
      <p>{t("error.text")}</p>
      <div className="actions">
        <Button variant="brand" type="button" onClick={() => reset()}>
          {t("error.retry")}
        </Button>
        <WhatsAppButton />
      </div>
    </main>
  );
}
