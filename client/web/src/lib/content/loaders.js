import config from "@/config";
import { defaultLocale } from "@/i18n/routing";
import { cachedFor } from "@/utils/api-helpers";
import { ARTICLES_TAG, articleTag, fetchAllArticles, fetchArticleBySlug } from "@/services/article-service";
import {
  CASE_STUDIES_TAG,
  caseStudyTag,
  fetchAllCaseStudies,
  fetchCaseStudyBySlug,
} from "@/services/case-study-service";
import { getAllPages, getSummaries } from "@/lib/pages/content";
import { resolveContentPath } from "@/lib/pages/resolve";
import {
  articleToPage,
  articleToSummary,
  caseStudyToPage,
  caseStudyToSummary,
  slugFromHref,
} from "./adapters";

// Server-side data for the article and case-study screens: the API record
// (cached, refreshed by tag) turned into the page shape the templates read,
// with the built-in pages as a migration fallback (config.content_static_fallback).

const KINDS = {
  article: {
    segment: "articles",
    staticTypes: ["article"],
    tag: ARTICLES_TAG,
    tagFor: articleTag,
    fetchAll: fetchAllArticles,
    fetchBySlug: fetchArticleBySlug,
    toPage: articleToPage,
    toSummary: articleToSummary,
  },
  "case-study": {
    segment: "case-studies",
    staticTypes: ["case-study"],
    tag: CASE_STUDIES_TAG,
    tagFor: caseStudyTag,
    fetchAll: fetchAllCaseStudies,
    fetchBySlug: fetchCaseStudyBySlug,
    toPage: caseStudyToPage,
    toSummary: caseStudyToSummary,
  },
};

const settle = (promise, fallback) => promise.catch(() => fallback);

// ── lists ────────────────────────────────────────────────────────────────────

// Every published record, or undefined when the API cannot be reached (the
// client hook then loads it itself and shows its loading / error state).
export const loadInitialList = (kind) => {
  const { fetchAll, tag } = KINDS[kind];
  return fetchAll({}, cachedFor(tag)).catch(() => undefined);
};

// Built-in summaries shown next to API records. `extraTypes` are always kept
// (guides stay built in); the kind's own type only while the fallback is on.
export const loadStaticSummaries = (kind, locale, extraTypes = []) => {
  const types = [...extraTypes, ...(config.content_static_fallback ? KINDS[kind].staticTypes : [])];
  return getSummaries(locale)
    .filter((page) => types.includes(page.type))
    .map((page) => ({ ...page, slug: slugFromHref(page.href) }));
};

// ── details ──────────────────────────────────────────────────────────────────

// Other published records for the "keep exploring" blocks of an API page.
const relatedItems = async (kind, slug) => {
  const own = KINDS[kind];
  const other = KINDS[kind === "article" ? "case-study" : "article"];
  const [same, different] = await Promise.all([
    settle(own.fetchAll({}, cachedFor(own.tag)), { items: [] }),
    settle(other.fetchAll({}, cachedFor(other.tag)), { items: [] }),
  ]);
  return [
    ...same.items.filter((item) => item.slug !== slug).slice(0, 6).map(own.toSummary),
    ...different.items.slice(0, 4).map(other.toSummary),
  ];
};

// What a detail route should do for /{locale}/{segment}/{slug}:
//   { kind: "page", page }       render it
//   { kind: "redirect", path }   language not available -> English
//   { kind: "missing" }          404
export const loadDetail = async (kind, slug, locale) => {
  const { segment, fetchBySlug, tag, tagFor, toPage } = KINDS[kind];
  const path = `/${segment}/${slug}`;

  const builtIn = () => {
    const found = resolveContentPath(locale, path);
    if (found.kind === "page") return { kind: "page", page: found.page };
    if (found.kind === "fallback") return { kind: "redirect", path: found.path };
    return { kind: "missing" };
  };

  // API content is English; other languages only exist for built-in pages.
  if (locale !== defaultLocale) {
    const found = builtIn();
    return found.kind === "missing"
      ? { kind: "redirect", path: `/${defaultLocale}${path}?language=${locale}-unavailable` }
      : found;
  }

  let record = null;
  let failed = false;
  try {
    record = await fetchBySlug(slug, cachedFor(tag, tagFor(slug)));
  } catch (error) {
    failed = true;
    if (!config.content_static_fallback) throw error;
  }

  if (record) {
    return { kind: "page", page: { ...toPage(record), relatedItems: await relatedItems(kind, slug) } };
  }
  // Unknown to the API (or the API is down): the built-in page, if allowed.
  if (config.content_static_fallback || failed) return builtIn();
  return { kind: "missing" };
};

// ── static params ────────────────────────────────────────────────────────────

// Slugs to pre-render for a locale (API records + built-in pages when allowed).
// The API being down at build time only means fewer pages are pre-rendered:
// the rest render on first visit.
export const loadStaticParams = async (kind, locale) => {
  const { segment, staticTypes, fetchAll, tag } = KINDS[kind];
  const slugs = new Set();

  if (locale === defaultLocale) {
    const { items } = await settle(fetchAll({}, cachedFor(tag)), { items: [] });
    items.forEach((item) => slugs.add(item.slug));
  }
  if (config.content_static_fallback || locale !== defaultLocale) {
    getAllPages()
      .filter((page) => page.locale === locale && staticTypes.includes(page.type))
      .forEach((page) => slugs.add(slugFromHref(page.href || `/${segment}/${page.id}`)));
  }
  return [...slugs].map((slug) => ({ slug }));
};
