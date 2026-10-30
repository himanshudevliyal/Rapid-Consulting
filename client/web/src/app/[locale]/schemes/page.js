import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { contentPageMetadata, robots } from "@/lib/seo";
import { hasValues, pickParams } from "@/lib/url-filters";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { resolveContentPath } from "@/lib/pages/resolve";
import { loadInitialList } from "@/lib/content/loaders";
import { loadManagedPage } from "@/lib/content/site-page-data";
import { dataOf, mt, rowsOf, withManagedMeta } from "@/lib/pages/managed-view";
import { fetchAllIndustries, INDUSTRIES_TAG } from "@/services/industry-service";
import { cachedFor } from "@/utils/api-helpers";
import { mainSiteHref } from "@/lib/site";
import { SchemesPage } from "./_components/SchemesPage";

const PATH = "/schemes";
// Filters an incoming link may carry (industry page, topic preset, search).
const FILTER_KEYS = ["q", "industry", "topic"];

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  const managed = await loadManagedPage("schemes", locale);
  const metadata = contentPageMetadata(withManagedMeta(found.page, managed), locale, t("meta.siteName"), PATH);
  // A filtered directory (?industry=, ?topic=, ?q=) is a view, not a page of
  // its own: it stays out of search results and its canonical is the plain
  // directory address (set by contentPageMetadata).
  if (hasValues(pickParams(await searchParams, FILTER_KEYS), FILTER_KEYS)) {
    return { ...metadata, robots: { index: false, follow: true } };
  }
  return metadata;
}

export default async function SchemesRoute({ params, searchParams }) {
  const { locale } = await params;
  // ?industry=<slug> from an industry page, ?topic=, ?q=: the directory opens
  // already filtered (the address stays the source of truth, see SchemeDirectory).
  const filters = pickParams(await searchParams, FILTER_KEYS);
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  // Published schemes and the industries (for the industry filter) from the API.
  const [initialData, initialIndustries, managed] = await Promise.all([
    loadInitialList("scheme"),
    fetchAllIndustries({}, cachedFor(INDUSTRIES_TAG)).catch(() => undefined),
    loadManagedPage("schemes", locale),
  ]);
  // Breadcrumb text from the page's hero (Home / Subsidies / Scheme directory), built-in wording otherwise.
  const crumbs = rowsOf(dataOf(managed, "hero").breadcrumb);
  const crumb = (index, fallback) => (crumbs.length === 3 ? mt(crumbs[index].label, fallback) : fallback);
  return (
    <>
      <PageAlternates
        en={`/en${PATH}`}
        hi={found.page.hasHindi ? `/hi${PATH}` : null}
      />
      <Breadcrumbs
        items={[
          { label: crumb(0, t("common.home")), href: `/${locale}` },
          { label: crumb(1, t.has("breadcrumb.subsidies") ? t("breadcrumb.subsidies") : "Subsidies & Incentives"), href: mainSiteHref("S01", locale) },
          { label: crumb(2, managed?.page?.title || found.page.title) },
        ]}
      />
      <main id="main">
        <SchemesPage
          page={found.page}
          t={t}
          locale={locale}
          initialData={initialData}
          initialIndustries={initialIndustries}
          filters={filters}
          managed={managed}
        />
      </main>
    </>
  );
}
