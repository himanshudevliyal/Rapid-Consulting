import { defaultLocale, locales, localeTags } from "@/i18n/routing";
import config from "@/config";
import { fetchServices } from "@/services/service-service";
import { fetchAllArticles } from "@/services/article-service";
import { fetchAllCaseStudies } from "@/services/case-study-service";
import { ALLOW_INDEXING, absoluteUrl } from "@/lib/site";
import { pageRoutes } from "@/lib/page-routes";
import { getAllPages } from "@/lib/pages/content";
import { SERVICE_TYPES } from "@/lib/pages/resolve";

export const revalidate = 3600;

// One entry per real language version, each listing its hreflang siblings.
export default async function sitemap() {
  if (!ALLOW_INDEXING) return [];

  const services = await fetchServices(defaultLocale).catch(() => []);
  const empty = { items: [] };
  const [articles, caseStudies] = await Promise.all([
    fetchAllArticles().catch(() => empty),
    fetchAllCaseStudies().catch(() => empty),
  ]);
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
    // Built-in articles / case studies are listed only while they are still a fallback.
    if (!config.content_static_fallback && ["article", "case-study"].includes(page.type)) continue;
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

  // Published articles and case studies from the API (English only).
  const listed = new Set(entries.map((entry) => entry.url));
  const addRecords = (records, segment) => {
    for (const record of records) {
      const path = `/${segment}/${record.slug}`;
      const url = absoluteUrl(`/${defaultLocale}${path}`);
      if (listed.has(url)) continue;
      listed.add(url);
      entries.push({
        url,
        lastModified: record.updated_at,
        alternates: alternates(path, [defaultLocale]),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  };
  addRecords(articles.items, "articles");
  addRecords(caseStudies.items, "case-studies");
  return entries;
}
