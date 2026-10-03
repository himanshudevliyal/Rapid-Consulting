import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { PageView } from "@/components/pages/page-view";
import { getPage } from "@/lib/pages/content";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = getPage("H01", locale) || getPage("H01", "en");
  const t = await getTranslations({ locale });
  return contentPageMetadata(page, locale, t("meta.siteName"), "");
}

export default async function HomeRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getPage("H01", locale) || getPage("H01", "en");
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);
  return (
    <>
      <PageAlternates en="/en" hi={page.hasHindi ? "/hi" : null} />
      <PageView page={page} t={t} has={has} />
    </>
  );
}
