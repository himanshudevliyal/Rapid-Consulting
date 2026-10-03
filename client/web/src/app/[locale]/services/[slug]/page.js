import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { fetchServiceBySlug, fetchServices } from "@/services/service-service";
import { localizeService } from "@/lib/content";
import { robots, serviceMetadata } from "@/lib/seo";
import { ServicePage } from "../_components/ServicePage";

// One API call per request, shared by generateMetadata and the page.
const getService = cache((slug, locale) => fetchServiceBySlug(slug, locale));
const getServices = cache((locale) => fetchServices(locale));

// Services added in the admin panel after a build render on first request.
export const dynamicParams = true;

// Pre-render every service in every language it really exists in.
export async function generateStaticParams({ params }) {
  const { locale } = await params;
  try {
    const services = await getServices(locale);
    return services.filter((service) => service.available_locales.includes(locale)).map((service) => ({ slug: service.slug }));
  } catch {
    return []; // API unavailable at build time: pages render on demand.
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [service, t] = await Promise.all([getService(slug, locale), getTranslations({ locale })]);
  if (!service || service.is_fallback) return { robots };
  return serviceMetadata(service, locale, t("meta.siteName"));
}

export default async function ServiceRoute({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const service = await getService(slug, locale);
  if (!service) notFound();

  // No real translation for this language: open the English page with a
  // notice, never an English page disguised as Hindi.
  if (service.is_fallback) {
    redirect(`/${defaultLocale}/services/${slug}?language=${locale}-unavailable`);
  }

  const [services, t] = await Promise.all([getServices(locale), getTranslations({ locale })]);
  const has = hasTranslation(t);

  return <ServicePage service={localizeService(service, services)} services={services} locale={locale} t={t} has={has} />;
}

