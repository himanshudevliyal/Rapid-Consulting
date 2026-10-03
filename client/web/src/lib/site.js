import config from "@/config";
import { defaultLocale } from "@/i18n/routing";
import { pageRoutes } from "@/lib/page-routes";

export const SITE_URL = config.next_public_url;

export const ALLOW_INDEXING = config.allow_indexing;

export const WHATSAPP_NUMBER = "919467248028";
export const WHATSAPP_LABEL = "+91 94672 48028";
export const PHONE_HREF = "tel:+919416506136";
export const PHONE_LABEL = "+91 94165 06136";
export const EMAIL = "info@rapidconsulting.in";

export const servicesHref = (locale) => `/${locale}/services`;

export const serviceHref = (service, locale) => {
  // Real counterparts only: a service without this language opens in English.
  const target = service.available_locales?.includes(locale) ? locale : defaultLocale;
  return `/${target}/services/${service.slug}`;
};

// Link to a page by its content identity (e.g. "R02") at its slug URL on this
// site. Pages without a Hindi version open in English, as in the prototype.
export const mainSiteHref = (code, locale, hasLocale = true) => {
  const target = hasLocale ? locale : defaultLocale;
  const path = pageRoutes[code];
  if (path === undefined) return `/${target}`;
  return `/${target}${path}`;
};

export const absoluteUrl = (path) => `${SITE_URL}${path}`;
