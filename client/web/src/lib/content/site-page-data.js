import { cachedFor } from "@/utils/api-helpers";
import { defaultLocale, localeTags, locales } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/site";
import { fetchAllArticles, ARTICLES_TAG } from "@/services/article-service";
import { fetchAllCaseStudies, CASE_STUDIES_TAG } from "@/services/case-study-service";
import { fetchAllSchemes, SCHEMES_TAG } from "@/services/scheme-service";
import { fetchAllAdvisers, ADVISERS_TAG } from "@/services/adviser-service";
import { fetchServices } from "@/services/service-service";
import {
  SITE_PAGES_TAG,
  cleanSitePath,
  fetchSitePageByPath,
  fetchSitePageList,
  fetchSitePagePreview,
  fetchSitePageRegistry,
  sitePageTag,
} from "@/services/site-page-service";
import { adviserToMember, articleToSummary, caseStudyToSummary, schemeToSummary } from "./adapters";
import { asText, languagePaths, normalizePage, recordRefs } from "./site-page-adapters";
import { robots } from "@/lib/seo";

// Server-side loaders for pages composed in the admin panel. A missing page is
// a normal answer ({ kind: "missing" }); an API outage is thrown so the route's
// error page shows instead of a wrongly cached 404. Everything that only
// decorates a page (registry, linked records, breadcrumb parents) degrades to
// "nothing" instead.

const settle = (promise, fallback) => promise.catch(() => fallback);

export const MANAGED_TEMPLATE = "managed";

// What the content route should do for /{locale}/{path}:
//   { kind: "page", page } | { kind: "redirect", path } | { kind: "missing" }
// A Hindi URL with no Hindi version redirects to the English page (when there
// is one) with ?language=hi-unavailable, like the other content.
export async function loadSitePage(path, locale) {
  const clean = cleanSitePath(path);
  if (!clean) return { kind: "missing" };
  const options = cachedFor(SITE_PAGES_TAG, sitePageTag(clean));
  const own = await fetchSitePageByPath(clean, locale, options);
  // Managed pages (About, Contact, Home ...) are drawn by the website's own
  // views, never by this catch-all route (and "home" must not appear at /home).
  if (own?.id && own.template === MANAGED_TEMPLATE) return { kind: "missing" };
  if (own?.id) return { kind: "page", page: normalizePage(own) };
  if (locale !== defaultLocale) {
    const english = await fetchSitePageByPath(clean, defaultLocale, options);
    if (english?.id && english.template !== MANAGED_TEMPLATE) return { kind: "redirect", path: `/${defaultLocale}/${clean}?language=${locale}-unavailable` };
  }
  return { kind: "missing" };
}

// A managed page (template "managed": the text of About, Contact, Resources,
// the scheme directory, the case archive, How we work and Home) for the views
// that draw those pages. Never throws: null when the page does not exist, is not
// published in that language, is not a managed page or the API cannot be read,
// and the view then keeps its built-in wording.
//
//   const managed = await loadManagedPage("about", locale);
//   managed?.get("hero")   -> the section's data object, or null
//   managed?.byKey         -> { [anchor]: section }  (visible sections only)
//   managed?.list          -> visible sections in order
//   managed?.page          -> normalized page record (title, h1, metaTitle ...)
//
// The path is the page's own path ("about", "schemes", "case-studies", "home").
// A Hindi page that has no Hindi version falls back to the English one.
export async function loadManagedPage(path, locale = defaultLocale) {
  try {
    const clean = cleanSitePath(path);
    if (!clean) return null;
    const options = cachedFor(SITE_PAGES_TAG, sitePageTag(clean));
    let raw = await fetchSitePageByPath(clean, locale, options);
    if (!raw?.id && locale !== defaultLocale) raw = await fetchSitePageByPath(clean, defaultLocale, options);
    if (!raw?.id || asText(raw.template) !== MANAGED_TEMPLATE) return null;
    return managedView(normalizePage(raw));
  } catch {
    return null;
  }
}

// The draft of a managed page (editor preview).
export function managedView(page) {
  const list = (page?.sections ?? []).filter((section) => section?.visible !== false && section?.type);
  const byKey = Object.fromEntries(list.map((section) => [section.anchor, section]));
  return {
    page,
    list,
    byKey,
    get: (key) => byKey[key]?.data ?? null,
  };
}

// The draft behind a preview link, or { kind: "missing" } for a bad / expired token.
export async function loadSitePagePreview(id, token) {
  if (!id || !token) return { kind: "missing" };
  const raw = await fetchSitePagePreview(id, token);
  return raw?.id ? { kind: "page", page: normalizePage(raw) } : { kind: "missing" };
}

// The block registry as the API serves it (null when it cannot be read: the
// renderer then uses its built-in copy).
export const loadSitePageRegistry = () =>
  settle(fetchSitePageRegistry(cachedFor(SITE_PAGES_TAG, "site-page-registry")), null);

// Every published page, for the sitemap: [{ id, groupId, locale, path, title, updatedAt, template }].
export async function loadSitePageEntries() {
  const lists = await Promise.all(
    locales.map((locale) => settle(fetchSitePageList({ locale, limit: 500 }, cachedFor(SITE_PAGES_TAG)), [])),
  );
  return lists
    .flat()
    .filter((entry) => entry?.path && locales.includes(entry.locale) && entry.template !== MANAGED_TEMPLATE)
    .map((entry) => ({
      id: entry.id,
      groupId: entry.group_id || entry.id,
      locale: entry.locale,
      path: cleanSitePath(entry.path),
      title: entry.title || "",
      template: entry.template || "",
      updatedAt: entry.updated_at || undefined,
    }));
}

// Breadcrumb parents: for "your-project/setting-up", the published page at
// "your-project" if there is one. Segments without a page are left out.
export async function loadSitePageParents(page) {
  const segments = page.path.split("/").filter(Boolean);
  if (segments.length < 2) return [];
  const list = await settle(fetchSitePageList({ locale: page.locale, limit: 500 }, cachedFor(SITE_PAGES_TAG)), []);
  const byPath = new Map(list.map((entry) => [cleanSitePath(entry.path), entry]));
  const parents = [];
  for (let i = 1; i < segments.length; i += 1) {
    const entry = byPath.get(segments.slice(0, i).join("/"));
    if (entry?.title) parents.push({ label: entry.title, href: `/${page.locale}/${cleanSitePath(entry.path)}` });
  }
  return parents;
}

// ── linked records ──

// Records in the order the editor picked them; a record that cannot be found
// (deleted, unpublished, not in this list) is silently skipped.
const inPickedOrder = (refs, records, toSummary) => {
  const out = [];
  const seen = new Set();
  for (const ref of refs) {
    const found = records.find(
      (record) => (ref.id && String(record.id) === ref.id) || (ref.slug && record.slug && record.slug === ref.slug),
    );
    if (!found || seen.has(found.id)) continue;
    seen.add(found.id);
    out.push(toSummary(found));
  }
  return out;
};

const SOURCES = {
  scheme: () =>
    settle(fetchAllSchemes({}, cachedFor(SCHEMES_TAG)), { items: [] }).then((result) => ({
      records: result.items,
      toSummary: schemeToSummary,
    })),
  case_study: () =>
    settle(fetchAllCaseStudies({}, cachedFor(CASE_STUDIES_TAG)), { items: [] }).then((result) => ({
      records: result.items,
      toSummary: caseStudyToSummary,
    })),
  article: () =>
    settle(fetchAllArticles({}, cachedFor(ARTICLES_TAG)), { items: [] }).then((result) => ({
      records: result.items,
      toSummary: articleToSummary,
    })),
  adviser: () =>
    settle(fetchAllAdvisers(cachedFor(ADVISERS_TAG)), { items: [] }).then((result) => ({
      records: result.items,
      toSummary: adviserToMember,
    })),
  service: ({ locale }) =>
    settle(fetchServices(locale), []).then((records) => ({
      records,
      toSummary: (service) => service,
    })),
};

// { [section.id]: [summary, ...] } for every section whose block links records.
//   recordTypeOf(blockType) -> "scheme" | "case_study" | "article" | "adviser" | "service" | undefined
// Each list is fetched once per type, however many sections use it.
export async function loadLinkedRecords(sections, locale, recordTypeOf) {
  const wanted = sections
    .map((section) => ({ section, type: recordTypeOf(section.type), refs: recordRefs(section.data) }))
    .filter((entry) => entry.type && SOURCES[entry.type] && entry.refs.length);
  const types = [...new Set(wanted.map((entry) => entry.type))];
  const loaded = Object.fromEntries(
    await Promise.all(types.map(async (type) => [type, await SOURCES[type]({ locale })])),
  );
  const result = {};
  for (const { section, type, refs } of wanted) {
    const { records, toSummary } = loaded[type];
    result[section.id] = inPickedOrder(refs, asRecords(records), toSummary);
  }
  return result;
}

const asRecords = (records) => (Array.isArray(records) ? records.filter((record) => record && typeof record === "object") : []);

// ── metadata ──

// Title, description, canonical, hreflang (only versions that exist) and
// robots from the page record. `meta_title || title`.
export function sitePageMetadata(page, siteName) {
  const paths = languagePaths(page);
  const available = locales.filter((locale) => paths[locale]);
  const url = absoluteUrl(paths[page.locale]);
  const title = page.metaTitle || `${page.title || page.h1} | ${siteName}`;
  const description = page.metaDescription || undefined;
  const languages = Object.fromEntries(available.map((locale) => [localeTags[locale], absoluteUrl(paths[locale])]));
  languages["x-default"] = absoluteUrl(paths[defaultLocale] || paths[page.locale]);
  const og = (locale) => localeTags[locale].replace("-", "_");
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName,
      locale: og(page.locale),
      alternateLocale: available.filter((locale) => locale !== page.locale).map(og),
      images: [{ url: absoluteUrl("/assets/rapid-logo-original.png") }],
    },
    twitter: { card: "summary", title, description },
    robots,
  };
}

// A draft preview is never indexed or followed, whatever the site setting.
export const previewMetadata = (page) => ({
  title: { absolute: `Preview: ${page?.title || page?.h1 || "Page"}` },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
});
