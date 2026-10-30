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

// Google Maps embed of the Rapid Consulting office, Hisar.
export const OFFICE_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3484.6546383250857!2d75.71726797942208!3d29.145375397169552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391232d6785c2e3d%3A0x84cef73c556785b2!2sRapid%20Consulting!5e0!3m2!1sen!2sin!4v1793286408758!5m2!1sen!2sin";

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
