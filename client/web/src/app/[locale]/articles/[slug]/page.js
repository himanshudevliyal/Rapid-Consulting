import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { PageView } from "@/components/pages/page-view";
import { loadDetail, loadStaticParams } from "@/lib/content/loaders";

// Article pages: the published record from the API (cached; the admin panel
// refreshes it on save), rendered with the same template as before.
// Slugs the API does not know yet fall back to the built-in page (see
// CONTENT_STATIC_FALLBACK); unknown ones are a 404.
export const dynamicParams = true;

export async function generateStaticParams({ params }) {
  const { locale } = await params;
  return loadStaticParams("article", locale);
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const found = await loadDetail("article", slug, locale);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), `/articles/${slug}`);
}

export default async function ArticleDetailRoute({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const found = await loadDetail("article", slug, locale);
  if (found.kind === "missing") notFound();
  if (found.kind === "redirect") redirect(found.path);

  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);
  const path = `/articles/${slug}`;
  return (
    <>
      <PageAlternates en={`/en${path}`} hi={found.page.hasHindi ? `/hi${path}` : null} />
      <PageView page={found.page} t={t} has={has} />
    </>
  );
}
