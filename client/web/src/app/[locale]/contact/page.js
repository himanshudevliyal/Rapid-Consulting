import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { resolveContentPath } from "@/lib/pages/resolve";
import { loadManaged, withManagedMeta } from "@/lib/content/managed-text";
import { ContactPage } from "./_components/ContactPage";

const PATH = "/contact";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const [t, managed] = await Promise.all([getTranslations({ locale }), loadManaged("contact", locale)]);
  return withManagedMeta(contentPageMetadata(found.page, locale, t("meta.siteName"), PATH), managed);
}

export default async function ContactRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const [t, managed] = await Promise.all([getTranslations({ locale }), loadManaged("contact", locale)]);
  const has = hasTranslation(t);

  return (
    <>
      <PageAlternates
        en={`/en${PATH}`}
        hi={found.page.hasHindi ? `/hi${PATH}` : null}
      />
      <ContactPage
        page={found.page}
        t={t}
        has={has}
        managed={managed}
      />
    </>
  );
}
