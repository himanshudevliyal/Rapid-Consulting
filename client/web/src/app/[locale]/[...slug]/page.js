import { cache } from "react";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { isLocale } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasTranslation } from "@/i18n/has-translation";
import { pageRoutes } from "@/lib/page-routes";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { PageView } from "@/components/pages/page-view";
import { contentStaticParams, resolveContentPath } from "@/lib/pages/resolve";
import { loadSitePage, sitePageMetadata } from "@/lib/content/site-page-data";
import { SitePageView } from "@/components/site-pages/site-page-view";

// Home, industries, schemes, articles, guides, case studies, about, contact,
// team, careers, policy… at their slug URLs (e.g. /en/schemes/pmegp-kvic-scheme).
export const dynamicParams = true; // Hindi URLs without a Hindi version redirect to English.

export async function generateStaticParams({ params }) {
  const { locale } = await params;
  return contentStaticParams(locale);
}

const pathOf = (slug) => `/${slug.map(decodeURIComponent).join("/")}`;

// Pages composed in the admin panel from sections (hubs, situation, campaign,
// resource, service, profile and scheme pages): the fallback when the path is
// not one of the written pages. One lookup per request, shared by
// generateMetadata and the page.
//   { kind: "page", page } | { kind: "redirect", path } | { kind: "missing" }
const resolveSitePage = cache((locale, path) => loadSitePage(path, locale));

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const path = pathOf(slug);
  const found = resolveContentPath(locale, path);
  if (found.kind === "missing") {
    const site = await resolveSitePage(locale, path).catch(() => ({ kind: "missing" }));
    if (site.kind !== "page") return { robots };
    const t = await getTranslations({ locale });
    return sitePageMetadata(site.page, t("meta.siteName"));
  }
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), path);
}

export default async function ContentRoute({ params, searchParams }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const path = pathOf(slug);
  const found = resolveContentPath(locale, path);
  if (found.kind === "missing") {
    const site = await resolveSitePage(locale, path);
    if (site.kind === "redirect") redirect(site.path);
    if (site.kind !== "page") notFound();
    setRequestLocale(locale);
    const query = await searchParams;
    return (
      <SitePageView
        page={site.page}
        locale={locale}
        topic={typeof query?.topic === "string" ? query.topic : ""}
      />
    );
  }
  if (found.kind === "service") permanentRedirect(`/${locale}${pageRoutes[found.id]}`);
  if (found.kind === "fallback") redirect(found.path);

  setRequestLocale(locale);
  const [t, query] = await Promise.all([getTranslations({ locale }), searchParams]);
  const has = hasTranslation(t);
  const industry = typeof query?.industry === "string" ? query.industry : "";
  return (
    <>
      <PageAlternates en={`/en${path}`} hi={found.page.hasHindi ? `/hi${path}` : null} />
      <PageView page={found.page} t={t} has={has} industry={industry} />
    </>
  );
}
