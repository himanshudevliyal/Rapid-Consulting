import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { AboutUsView } from "@/components/pages/about-view";
import { ManagedAboutView } from "@/components/pages/about-managed-view";
import { resolveContentPath } from "@/lib/pages/resolve";
import { loadManaged, withManagedMeta } from "@/lib/content/managed-text";

const PATH = "/about";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [found, managed] = await Promise.all([Promise.resolve(resolveContentPath(locale, PATH)), loadManaged("about", locale)]);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return withManagedMeta(contentPageMetadata(found.page, locale, t("meta.siteName"), PATH), managed);
}

// About us. The text comes from the managed page "about" (admin panel -> Pages)
// when it is published; otherwise the built-in manuscript is shown: The Rapid
// Story, The Rapid Advantage, The Rapid Team (from the Advisers in the admin
// panel) and the Discuss Your Project form.
export default async function AboutRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const [t, managed] = await Promise.all([getTranslations({ locale }), loadManaged("about", locale)]);
  const has = hasTranslation(t);

  return (
    <>
      <PageAlternates en={`/en${PATH}`} hi={found.page.hasHindi ? `/hi${PATH}` : null} />
      {managed ? (
        <ManagedAboutView managed={managed} page={found.page} t={t} has={has} locale={locale} />
      ) : (
        <AboutUsView page={found.page} t={t} has={has} />
      )}
    </>
  );
}
