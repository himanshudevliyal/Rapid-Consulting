import { defaultLocale, locales, localeTags } from "@/i18n/routing";
import { fetchServices } from "@/services/service-service";
import { ALLOW_INDEXING, absoluteUrl } from "@/lib/site";
import { pageRoutes } from "@/lib/page-routes";
import { getAllPages } from "@/lib/pages/content";
import { SERVICE_TYPES } from "@/lib/pages/resolve";

export const revalidate = 3600;

// One entry per real language version, each listing its hreflang siblings.
export default async function sitemap() {
  if (!ALLOW_INDEXING) return [];

  const services = await fetchServices(defaultLocale).catch(() => []);
  const alternates = (path, available) => ({
    languages: Object.fromEntries(available.map((locale) => [localeTags[locale], absoluteUrl(`/${locale}${path}`)])),
  });

  const entries = [
    ...locales.slice(0, 1).map((locale) => ({
      url: absoluteUrl(`/${locale}/services`),
      alternates: alternates("/services", [defaultLocale]),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];

  for (const service of services) {
    const path = `/services/${service.slug}`;
    for (const locale of service.available_locales) {
      entries.push({
        url: absoluteUrl(`/${locale}${path}`),
        lastModified: service.updated_at,
        alternates: alternates(path, service.available_locales),
        changeFrequency: "monthly",
        priority: service.type === "service-family" ? 0.7 : 0.6,
      });
    }
  }
  // Home, industries, schemes, articles, guides, case studies, about, contact…
  for (const page of getAllPages()) {
    if (page.locale !== defaultLocale || SERVICE_TYPES.includes(page.type) || pageRoutes[page.id] === undefined) continue;
    const path = pageRoutes[page.id];
    const available = page.hasHindi ? locales : [defaultLocale];
    for (const locale of available) {
      entries.push({
        url: absoluteUrl(`/${locale}${path}`),
        alternates: alternates(path, available),
        changeFrequency: page.id === "H01" || page.type.endsWith("index") ? "weekly" : "monthly",
        priority: page.id === "H01" ? 1 : page.type.endsWith("index") ? 0.8 : 0.6,
      });
    }
  }
  return entries;
}
