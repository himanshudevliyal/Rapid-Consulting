import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { PageView } from "@/components/pages/page-view";
import { resolveContentPath, contentStaticParams } from "@/lib/pages/resolve";
import { getAllPages } from "@/lib/pages/content";

export const dynamicParams = true;

export async function generateStaticParams({ params }) {
  const { locale } = await params;
  // Return only industry detail slugs (I01, I02, …) — not I00 (the index)
  return getAllPages()
    .filter(
      (page) =>
        page.locale === locale &&
        page.type === "industry" &&
        page.id !== "I00",
    )
    .map((page) => {
      // href is like "/industries/food-and-agro-processing" — take last segment
      const segments = (page.href ?? "").split("/").filter(Boolean);
      return { slug: segments[segments.length - 1] ?? page.id };
    });
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const path = `/industries/${slug}`;
  const found = resolveContentPath(locale, path);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), path);
}

export default async function IndustryDetailRoute({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const path = `/industries/${slug}`;
  const found = resolveContentPath(locale, path);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);
  return (
    <>
      <PageAlternates en={`/en${path}`} hi={found.page.hasHindi ? `/hi${path}` : null} />
      <PageView page={found.page} t={t} has={has} />
    </>
  );
}
