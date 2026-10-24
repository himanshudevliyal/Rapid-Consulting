import { cachedFor } from "@/utils/api-helpers";
import { fetchServiceCategories, fetchServices } from "@/services/service-service";
import { ARTICLES_TAG, fetchArticles } from "@/services/article-service";
import { CASE_STUDIES_TAG, fetchAllCaseStudies, fetchCaseStudies } from "@/services/case-study-service";
import { SCHEMES_TAG, fetchSchemes } from "@/services/scheme-service";
import { INDUSTRIES_TAG, fetchAllIndustries } from "@/services/industry-service";
import { JOBS_TAG, fetchAllJobs, fetchJobBySlug, jobTag } from "@/services/job-service";
import { ADVISERS_TAG, fetchAllAdvisers } from "@/services/adviser-service";
import { defaultLocale } from "@/i18n/routing";
import {
  adviserToMember,
  articleToSummary,
  caseStudyToSummary,
  groupMembers,
  industryToSummary,
  jobToPage,
  jobToSummary,
  schemeToSummary,
} from "./adapters";
import { toCategoryGroups } from "../navigation";

// Server-side loaders for the parts of the site built from the API on every
// page: the menu and the home page sections. Each one degrades to "nothing to
// show" when the API cannot be reached, so the page itself still renders.

const EMPTY = { items: [] };
const settle = (promise, fallback) => promise.catch(() => fallback);

export const loadCategoryGroups = async (locale) =>
  toCategoryGroups(await settle(fetchServiceCategories(locale), []));

export const loadIndustries = async () =>
  (await settle(fetchAllIndustries({}, cachedFor(INDUSTRIES_TAG)), EMPTY)).items.map(industryToSummary);

export const loadCaseStudies = async ({ limit } = {}) => {
  const result = await settle(
    limit ? fetchCaseStudies({ limit }, cachedFor(CASE_STUDIES_TAG)) : fetchAllCaseStudies({}, cachedFor(CASE_STUDIES_TAG)),
    EMPTY,
  );
  return result.items.map(caseStudyToSummary);
};

export const loadGuides = async ({ limit = 3 } = {}) =>
  (await settle(fetchArticles({ type: "guide", limit }, cachedFor(ARTICLES_TAG)), EMPTY)).items.map(articleToSummary);

// Schemes marked "show on the home page"; when none is marked yet, the latest ones.
export const loadFeaturedSchemes = async ({ limit = 6 } = {}) => {
  const featured = await settle(fetchSchemes({ featured: "true", limit }, cachedFor(SCHEMES_TAG)), EMPTY);
  if (featured.items.length) return featured.items.map(schemeToSummary);
  return (await settle(fetchSchemes({ limit }, cachedFor(SCHEMES_TAG)), EMPTY)).items.map(schemeToSummary);
};

// Open jobs for the Careers page (newest first).
export const loadJobs = async () =>
  (await settle(fetchAllJobs({}, cachedFor(JOBS_TAG)), EMPTY)).items.map(jobToSummary);

// What the job route should do for /{locale}/careers/{slug}:
//   { kind: "page", page } | { kind: "redirect", path } | { kind: "missing" }
// The content is English; other languages open the English page with a notice.
export const loadJobDetail = async (slug, locale) => {
  if (locale !== defaultLocale) {
    return { kind: "redirect", path: `/${defaultLocale}/careers/${slug}?language=${locale}-unavailable` };
  }
  // An API outage throws (the route's error page); only a real "not found" is a 404.
  const job = await fetchJobBySlug(slug, cachedFor(JOBS_TAG, jobTag(slug)));
  return job ? { kind: "page", page: jobToPage(job) } : { kind: "missing" };
};

export const loadJobSlugs = async (locale) => {
  if (locale !== defaultLocale) return [];
  return (await settle(fetchAllJobs({}, cachedFor(JOBS_TAG)), EMPTY)).items.map((job) => ({ slug: job.slug }));
};

// The team on the About page: [{ title, members: [...] }] by group.
export const loadTeam = async () =>
  groupMembers((await settle(fetchAllAdvisers(cachedFor(ADVISERS_TAG)), EMPTY)).items.map(adviserToMember));

// Everything the header needs, in plain serialisable form.
export async function loadNavigation(locale) {
  const [services, categories, industries, cases, guides, schemes] = await Promise.all([
    settle(fetchServices(locale), []),
    loadCategoryGroups(locale),
    loadIndustries(),
    loadCaseStudies({ limit: 4 }),
    loadGuides({ limit: 4 }),
    loadFeaturedSchemes({ limit: 4 }),
  ]);
  return { services, categories, industries, cases, guides, schemes };
}
