import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { SvrPage } from "@/components/pages/svr-page";
import { copy } from "@/lib/pages/w4-copy";
import { standaloneMetadata } from "@/lib/pages/w4-meta";

const PATH = "/subsidy-viability-report";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return standaloneMetadata({
    locale,
    path: PATH,
    title: copy(t, "svr.name"),
    description: copy(t, "svr.meta.description"),
    siteName: t("meta.siteName"),
  });
}

export default async function SubsidyViabilityReportRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const name = copy(t, "svr.name");

  return (
    <>
      <PageAlternates en={`/en${PATH}`} hi={`/hi${PATH}`} />
      <Breadcrumbs
        items={[
          { label: t("common.home"), href: `/${locale}` },
          { label: name, href: `/${locale}${PATH}` },
        ]}
        t={t}
      />
      <SvrPage t={t} locale={locale} />
    </>
  );
}
