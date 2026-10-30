import { defaultLocale, locales, localeTags } from "@/i18n/routing";
import { fetchServices } from "@/services/service-service";
import { fetchAllArticles } from "@/services/article-service";
import { fetchAllCaseStudies } from "@/services/case-study-service";
import { fetchAllSchemes } from "@/services/scheme-service";
import { fetchAllIndustries } from "@/services/industry-service";
import { fetchAllJobs } from "@/services/job-service";
import { fetchAllAdvisers } from "@/services/adviser-service";
import { fetchAllSessions } from "@/services/session-service";
import { ALLOW_INDEXING, absoluteUrl } from "@/lib/site";
import { pageRoutes } from "@/lib/page-routes";
import { getAllPages } from "@/lib/pages/content";
import { SERVICE_TYPES } from "@/lib/pages/resolve";
import { loadSitePageEntries } from "@/lib/content/site-page-data";

export const revalidate = 3600;

// One entry per real language version, each listing its hreflang siblings.
export default async function sitemap() {
  if (!ALLOW_INDEXING) return [];

  const services = await fetchServices(defaultLocale).catch(() => []);
  const empty = { items: [] };
  const [articles, caseStudies, schemes, industries, jobs, advisers, sessions] = await Promise.all([
    fetchAllArticles().catch(() => empty),
    fetchAllCaseStudies().catch(() => empty),
    fetchAllSchemes().catch(() => empty),
    fetchAllIndustries().catch(() => empty),
    fetchAllJobs().catch(() => empty),
    fetchAllAdvisers().catch(() => empty),
    fetchAllSessions().catch(() => empty),
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
  // Home, the index pages, about, contact, team, careers… (written in the website).
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

  // Pages written in code: the Subsidy Viability Report and the sessions index.
  for (const path of ["/subsidy-viability-report", "/sessions"]) {
    entries.push(
      ...locales.map((locale) => ({
        url: absoluteUrl(`/${locale}${path}`),
        alternates: alternates(path, locales),
        changeFrequency: "monthly",
        priority: 0.6,
      })),
    );
  }

  // Published articles, guides, schemes, case studies, industries and open jobs from the
  // API (English only).
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
  addRecords(articles.items.filter((record) => record.type !== "guide"), "articles");
  addRecords(articles.items.filter((record) => record.type === "guide"), "guides");
  addRecords(schemes.items, "schemes");
  addRecords(caseStudies.items, "case-studies");
  addRecords(industries.items, "industries");
  addRecords(jobs.items, "careers");
  addRecords(sessions.items, "sessions");
  // Team profiles (stand-in profiles stay out until their real content arrives).
  addRecords(
    advisers.items.filter((record) => record.slug && !record.is_placeholder),
    "team",
  );

  // Pages composed in the admin panel (hubs, situation pages, profiles…), each in
  // the languages it is really published in. Counterparts share a group, and
  // may sit at different paths per language.
  const sitePages = await loadSitePageEntries().catch(() => []);
  const groups = new Map();
  for (const page of sitePages) groups.set(page.groupId, [...(groups.get(page.groupId) ?? []), page]);
  for (const page of sitePages) {
    const url = absoluteUrl(`/${page.locale}/${page.path}`);
    if (listed.has(url)) continue;
    listed.add(url);
    const group = groups.get(page.groupId) ?? [page];
    entries.push({
      url,
      lastModified: page.updatedAt,
      alternates: {
        languages: Object.fromEntries(
          group.map((member) => [localeTags[member.locale], absoluteUrl(`/${member.locale}/${member.path}`)]),
        ),
      },
      changeFrequency: "monthly",
      priority: page.template === "hub" ? 0.8 : 0.6,
    });
  }
  return entries;
}
