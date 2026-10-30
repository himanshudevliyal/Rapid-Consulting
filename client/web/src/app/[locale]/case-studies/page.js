import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { resolveContentPath } from "@/lib/pages/resolve";
import { loadInitialList } from "@/lib/content/loaders";
import { loadManagedPage } from "@/lib/content/site-page-data";
import { dataOf, mt, rowsOf, withManagedMeta } from "@/lib/pages/managed-view";
import { CaseStudiesPage } from "./_components/CaseStudiesPage";

const PATH = "/case-studies";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  const managed = await loadManagedPage("case-studies", locale);
  return contentPageMetadata(withManagedMeta(found.page, managed), locale, t("meta.siteName"), PATH);
}

export default async function CaseStudiesRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);
  const [initialData, managed] = await Promise.all([loadInitialList("case-study"), loadManagedPage("case-studies", locale)]);
  // Breadcrumb text from the page's hero ("Home" / "Work / Case studies"), built-in wording otherwise.
  const crumbs = rowsOf(dataOf(managed, "hero").breadcrumb);
  const home = crumbs.length > 1 ? mt(crumbs[0].label, t("common.home")) : t("common.home");
  const current = crumbs.length > 1 ? mt(crumbs[crumbs.length - 1].label, found.page.title) : found.page.title;
  return (
    <>
      <PageAlternates
        en={`/en${PATH}`}
        hi={found.page.hasHindi ? `/hi${PATH}` : null}
      />
      <Breadcrumbs
        items={[
          { label: home, href: `/${locale}` },
          { label: current, href: `/${locale}${PATH}` },
        ]}
      />
      <main id="main">
        <CaseStudiesPage
          page={found.page}
          t={t}
          has={has}
          locale={locale}
          initialData={initialData}
          managed={managed}
        />
      </main>
    </>
  );
}
