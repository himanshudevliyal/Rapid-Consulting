import { defaultLocale } from "@/i18n/routing";
import { cachedFor } from "@/utils/api-helpers";
import { ARTICLES_TAG, articleTag, fetchAllArticles, fetchAllGuides, fetchArticleBySlug } from "@/services/article-service";
import {
  CASE_STUDIES_TAG,
  caseStudyTag,
  fetchAllCaseStudies,
  fetchCaseStudyBySlug,
} from "@/services/case-study-service";
import { SCHEMES_TAG, fetchAllSchemes, fetchSchemeBySlug, schemeTag } from "@/services/scheme-service";
import { INDUSTRIES_TAG, fetchAllIndustries, fetchIndustryBySlug, industryTag } from "@/services/industry-service";
import {
  articleToPage,
  articleToSummary,
  caseStudyToPage,
  caseStudyToSummary,
  industryToPage,
  schemeToPage,
} from "./adapters";

// Server-side data for the content screens. Everything comes from the API
// (cached, refreshed by tag when an editor saves) and is turned into the page
// shape the templates read. Nothing is built into the website: a record that
// is deleted or unpublished in the admin panel disappears from the site.

const KINDS = {
  article: {
    segment: "articles",
    tag: ARTICLES_TAG,
    tagFor: articleTag,
    fetchAll: fetchAllArticles,
    fetchBySlug: fetchArticleBySlug,
    toPage: articleToPage,
    // Guides share the article API; each one lives at its own section.
    belongs: (record) => record.type !== "guide",
    otherSegment: "guides",
  },
  guide: {
    segment: "guides",
    tag: ARTICLES_TAG,
    tagFor: articleTag,
    fetchAll: fetchAllGuides,
    fetchBySlug: fetchArticleBySlug,
    toPage: articleToPage,
    belongs: (record) => record.type === "guide",
    otherSegment: "articles",
  },
  "case-study": {
    segment: "case-studies",
    tag: CASE_STUDIES_TAG,
    tagFor: caseStudyTag,
    fetchAll: fetchAllCaseStudies,
    fetchBySlug: fetchCaseStudyBySlug,
    toPage: caseStudyToPage,
  },
  scheme: {
    segment: "schemes",
    tag: SCHEMES_TAG,
    tagFor: schemeTag,
    fetchAll: fetchAllSchemes,
    fetchBySlug: fetchSchemeBySlug,
    toPage: schemeToPage,
  },
  industry: {
    segment: "industries",
    tag: INDUSTRIES_TAG,
    tagFor: industryTag,
    fetchAll: fetchAllIndustries,
    fetchBySlug: fetchIndustryBySlug,
    toPage: industryToPage,
  },
};

const settle = (promise, fallback) => promise.catch(() => fallback);
const EMPTY = { items: [] };

// ── lists ────────────────────────────────────────────────────────────────────

// Every published record, or undefined when the API cannot be reached (the
// client hook then loads it itself and shows its loading / error state).
export const loadInitialList = (kind) => {
  const { fetchAll, tag } = KINDS[kind];
  return fetchAll({}, cachedFor(tag)).catch(() => undefined);
};

// ── details ──────────────────────────────────────────────────────────────────

// Other published articles, guides and case studies for the "keep exploring"
// blocks of a page.
const relatedItems = async (kind, slug) => {
  const [writings, cases] = await Promise.all([
    settle(fetchAllArticles({}, cachedFor(ARTICLES_TAG)), EMPTY),
    settle(fetchAllCaseStudies({}, cachedFor(CASE_STUDIES_TAG)), EMPTY),
  ]);
  const writingKind = kind === "article" || kind === "guide";
  return [
    ...writings.items
      .filter((item) => !(writingKind && item.slug === slug))
      .slice(0, 6)
      .map(articleToSummary),
    ...cases.items
      .filter((item) => !(kind === "case-study" && item.slug === slug))
      .slice(0, 4)
      .map(caseStudyToSummary),
  ];
};

// What a detail route should do for /{locale}/{segment}/{slug}:
//   { kind: "page", page }       render it
//   { kind: "redirect", path }   another language / section -> where it lives
//   { kind: "missing" }          404
export const loadDetail = async (kind, slug, locale) => {
  const { segment, fetchBySlug, tag, tagFor, toPage, belongs, otherSegment } = KINDS[kind];

  // The content is English; other languages open the English page with a notice.
  if (locale !== defaultLocale) {
    return { kind: "redirect", path: `/${defaultLocale}/${segment}/${slug}?language=${locale}-unavailable` };
  }

  // An API outage throws (the route's error page); only a real "not found" is a 404.
  const record = await fetchBySlug(slug, cachedFor(tag, tagFor(slug)));
  if (!record) return { kind: "missing" };

  // A guide opened as an article (or the other way round) goes to its own address.
  if (belongs && !belongs(record)) return { kind: "redirect", path: `/${locale}/${otherSegment}/${slug}` };

  return { kind: "page", page: { ...toPage(record), relatedItems: await relatedItems(kind, slug) } };
};

// ── static params ────────────────────────────────────────────────────────────

// Slugs to pre-render. The API being down at build time only means fewer pages
// are pre-rendered: the rest render on first visit.
export const loadStaticParams = async (kind, locale) => {
  if (locale !== defaultLocale) return [];
  const { fetchAll, tag } = KINDS[kind];
  const { items } = await settle(fetchAll({}, cachedFor(tag)), EMPTY);
  return items.map((item) => ({ slug: item.slug }));
};
