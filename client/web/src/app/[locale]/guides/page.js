import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { resolveContentPath } from "@/lib/pages/resolve";
import { loadInitialList } from "@/lib/content/loaders";
import { ArticlesPage } from "../articles/_components/ArticlesPage";

// The guides collection: the same listing copy as the articles index, opened on
// Guides, with its own address for canonical and language alternates.
const COPY_PATH = "/articles";
const PATH = "/guides";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, COPY_PATH);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), PATH);
}

export default async function GuidesIndexRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, COPY_PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);
  // Published articles and guides from the API (cached, refreshed when an
  // editor saves). Both kinds are listed here.
  const initialData = await loadInitialList("article");
  return (
    <>
      <PageAlternates
        en={`/en${PATH}`}
        hi={found.page.hasHindi ? `/hi${PATH}` : null}
      />
      <Breadcrumbs
        items={[
          { label: t("common.home"), href: `/${locale}` },
          { label: found.page.title, href: `/${locale}${PATH}` },
        ]}
      />
      <main id="main">
        <ArticlesPage
          page={found.page}
          t={t}
          has={has}
          image="/assets/articles.jpg"
          initialData={initialData}
          defaultFormat="guide"
        />
      </main>
    </>
  );
}
