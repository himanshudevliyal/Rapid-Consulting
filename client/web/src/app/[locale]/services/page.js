import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { fetchServiceByCode, fetchServices } from "@/services/service-service";
import { localizeService } from "@/lib/content";
import { mainSiteHref, servicesHref } from "@/lib/site";
import { servicesIndexMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { Html } from "@/components/common/html";
import { ContactExperience } from "@/components/form/contact-experience";
import { PageAlternates } from "@/components/layout/page-alternates";
import { ServiceGuidance } from "./_components/ServiceGuidance";
import { ServicesDirectory } from "./_components/ServicesDirectory";

// One API call per request, shared by generateMetadata and the page.
// "S00" is the services landing page record (title, intro, guidance).
const getIndexPage = cache((locale) => fetchServiceByCode("S00", locale));
const getServices = cache((locale) => fetchServices(locale));

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [page, t] = await Promise.all([getIndexPage(locale).catch(() => null), getTranslations({ locale })]);
  return servicesIndexMetadata(page?.is_fallback ? null : page, locale, t);
}

export default async function ServicesIndex({ params, searchParams }) {
  const { locale } = await params;
  const { industry } = (await searchParams) ?? {};
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const [page, services, t] = await Promise.all([getIndexPage(locale), getServices(locale), getTranslations({ locale })]);

  if (page?.is_fallback) redirect(`${servicesHref(defaultLocale)}?language=${locale}-unavailable`);

  const content = page ? localizeService(page, services) : null;
  const title = content?.h1 || t("card.types.service-index");

  return (
    <main id="main">
      <PageAlternates en={servicesHref("en")} hi={page?.available_locales?.includes("hi") ? servicesHref("hi") : null} />
      
  <Breadcrumbs
        heading={title}
        paragraph={<Html html={content.intro_html} />}
        label={t("breadcrumb.label")}
        items={[
          {
            label: t("common.home"),
            href: mainSiteHref("H01", locale),
          },
          {
            label: content?.title || title,
          },
        ]}
      />
      
       
        <ServicesDirectory items={services} industry={typeof industry === "string" ? industry : ""} />
        {content && <ServiceGuidance sections={content.sections} />}
       
        <ClientTicker />
        <ContactExperience pageTitle={title} pageId="S00" variant="section" />
    
    </main>
  );
}
