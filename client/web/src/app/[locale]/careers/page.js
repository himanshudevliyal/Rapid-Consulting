import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { resolveContentPath } from "@/lib/pages/resolve";
import { CareersPage } from "./_components/CareersPage";

const PATH = "/careers";
const HERO_IMAGE = "/assets/hero-section.jpg";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), PATH);
}

export default async function CareersRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const has = hasTranslation(t);

  return (
    <>
      <PageAlternates
        en={`/en${PATH}`}
        hi={found.page.hasHindi ? `/hi${PATH}` : null}
      />
      <Breadcrumbs
        page={found.page}
        t={t}
        heading={found.page.h1}
        backgroundImage={HERO_IMAGE}
      />
      <CareersPage
        page={found.page}
        t={t}
        has={has}
        image={HERO_IMAGE}
      />
    </>
  );
}
