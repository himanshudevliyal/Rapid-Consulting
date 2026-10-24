import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JobView } from "@/components/pages/job-view";
import { loadJobDetail, loadJobSlugs } from "@/lib/content/site-data";

// Job pages: the open job from the API (cached; the admin panel refreshes the
// page the moment it is saved). A closed, hidden or unknown job is a 404.
export const dynamicParams = true;

export async function generateStaticParams({ params }) {
  const { locale } = await params;
  return loadJobSlugs(locale);
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const found = await loadJobDetail(slug, locale);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  return contentPageMetadata(found.page, locale, t("meta.siteName"), `/careers/${slug}`);
}

export default async function JobDetailRoute({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const found = await loadJobDetail(slug, locale);
  if (found.kind === "missing") notFound();
  if (found.kind === "redirect") redirect(found.path);

  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const path = `/careers/${slug}`;
  return (
    <>
      <PageAlternates en={`/en${path}`} hi={null} />
      <Breadcrumbs
        page={found.page}
        t={t}
        heading={found.page.h1}
        backgroundImage="/assets/hero-section.jpg"
      />
      <JobView page={found.page} t={t} />
    </>
  );
}
