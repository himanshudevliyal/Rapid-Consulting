import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { HomeView } from "@/components/pages/home-view";
import { getPage } from "@/lib/pages/content";
import { loadManaged, withManagedMeta } from "@/lib/content/managed-text";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = getPage("H01", locale) || getPage("H01", "en");
  const [t, managed] = await Promise.all([getTranslations({ locale }), loadManaged("home", locale)]);
  return withManagedMeta(contentPageMetadata(page, locale, t("meta.siteName"), ""), managed);
}

// Home: the text comes from the managed page "home" (admin panel -> Pages) when it
// is published; the sections keep their built-in wording otherwise.
export default async function HomeRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getPage("H01", locale) || getPage("H01", "en");
  setRequestLocale(locale);
  const [t, managed] = await Promise.all([getTranslations({ locale }), loadManaged("home", locale)]);
  const has = hasTranslation(t);
  return (
    <>
      <PageAlternates en="/en" hi={page.hasHindi ? "/hi" : null} />
      <main id="main">
        <HomeView page={page} t={t} has={has} managed={managed} />
      </main>
    </>
  );
}
