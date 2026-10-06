import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { resolveContentPath } from "@/lib/pages/resolve";
import { loadInitialList, loadStaticSummaries } from "@/lib/content/loaders";
import { CaseStudiesPage } from "./_components/CaseStudiesPage";

const PATH = "/case-studies";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), PATH);
}

export default async function CaseStudiesRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);
  const initialData = await loadInitialList("case-study");
  const staticItems = loadStaticSummaries("case-study", locale);
  return (
    <>
      <PageAlternates
        en={`/en${PATH}`}
        hi={found.page.hasHindi ? `/hi${PATH}` : null}
      />
      <Breadcrumbs
        heading={found.page.h1}
        items={[
          { label: t("common.home"), href: `/${locale}` },
          { label: found.page.title, href: `/${locale}${PATH}` },
        ]}
        backgroundImage="/assets/case-studies.png"
      />
      <main id="main">
        <CaseStudiesPage
          page={found.page}
          t={t}
          has={has}
          image="/assets/case-studies.png"
          initialData={initialData}
          staticItems={staticItems}
        />
      </main>
    </>
  );
}
