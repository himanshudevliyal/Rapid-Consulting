"use client";

import Link from "next/link";

import { useLocale, useTranslations } from "next-intl";
import { mainSiteHref, servicesHref } from "@/lib/site";
import Section from "@/components/layout/section";

export default function NotFound() {
  const locale = useLocale();
  const t = useTranslations();
  return (
    <Section className=" " id="main">
      <p className="eyebrow">{t("notFound.eyebrow")}</p>
      <h1>{t("notFound.title")}</h1>
      <p>{t("notFound.text")}</p>
      <div className="actions">
        <Link className="button" href={servicesHref(locale)}>
          {t("notFound.browseServices")}
        </Link>
        <a className="button button-secondary" href={mainSiteHref("H01", locale)}>
          {t("notFound.goHome")}
        </a>
      </div>
    </Section>
  );
}
