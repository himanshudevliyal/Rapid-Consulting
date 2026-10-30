import { cachedFor } from "@/utils/api-helpers";
import { fetchServiceCategories, fetchServices } from "@/services/service-service";
import { ARTICLES_TAG, fetchArticles } from "@/services/article-service";
import { CASE_STUDIES_TAG, fetchAllCaseStudies, fetchCaseStudies } from "@/services/case-study-service";
import { SCHEMES_TAG, fetchSchemes } from "@/services/scheme-service";
import { INDUSTRIES_TAG, fetchAllIndustries } from "@/services/industry-service";
import { JOBS_TAG, fetchAllJobs, fetchJobBySlug, jobTag } from "@/services/job-service";
import { ADVISERS_TAG, adviserTag, fetchAllAdvisers, fetchAdviserBySlug } from "@/services/adviser-service";
import { SESSIONS_TAG, fetchAllSessions, fetchSessionBySlug, sessionTag } from "@/services/session-service";
import { COMMUNITY_TAG, fetchCommunityGroups } from "@/services/community-service";
import { fetchNavigationSettings } from "@/services/navigation-service";
import { defaultLocale } from "@/i18n/routing";
import {
  adviserToMember,
  adviserToProfile,
  communityGroupToItem,
  sessionToPage,
  sessionToSummary,
  articleToSummary,
  caseStudyToSummary,
  groupMembers,
  industryToSummary,
  jobToPage,
  jobToSummary,
  schemeToSummary,
} from "./adapters";
import { toCategoryGroups } from "../navigation";
import { mergeNavigation } from "../site-navigation";

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

// One person's profile page, or null (unknown slug / hidden person).
export const loadTeamProfile = async (slug) => {
  const adviser = await fetchAdviserBySlug(slug, cachedFor(ADVISERS_TAG, adviserTag(slug)));
  return adviser ? adviserToProfile(adviser) : null;
};

export const loadTeamSlugs = async () =>
  (await settle(fetchAllAdvisers(cachedFor(ADVISERS_TAG)), EMPTY)).items
    .filter((adviser) => adviser.slug)
    .map((adviser) => ({ slug: adviser.slug }));

// ── Sessions (webinars) ──
// Every published session: upcoming first (soonest first), then the rest
// (latest first), so expired calls to join are never ahead of live ones.
export const loadSessions = async () => {
  const items = (await settle(fetchAllSessions({}, cachedFor(SESSIONS_TAG)), EMPTY)).items.map(sessionToSummary);
  const when = (session) => (session.startsAt ? new Date(session.startsAt).getTime() : 0);
  const upcoming = items.filter((session) => session.state === "upcoming").sort((a, b) => when(a) - when(b));
  const rest = items.filter((session) => session.state !== "upcoming").sort((a, b) => when(b) - when(a));
  return [...upcoming, ...rest];
};

export const loadSessionDetail = async (slug) => {
  const session = await fetchSessionBySlug(slug, cachedFor(SESSIONS_TAG, sessionTag(slug)));
  return session ? sessionToPage(session) : null;
};

export const loadSessionSlugs = async () =>
  (await settle(fetchAllSessions({}, cachedFor(SESSIONS_TAG)), EMPTY)).items.map((session) => ({ slug: session.slug }));

// ── WhatsApp community groups ── for one part of the site ("industries",
// "resources", "advisers", "home"); all active groups when none is given.
export const loadCommunityGroups = async ({ placement } = {}) =>
  (await settle(fetchCommunityGroups(placement ? { placement } : {}, cachedFor(COMMUNITY_TAG)), EMPTY)).items.map(
    communityGroupToItem,
  );

// The central navigation (primary destinations + footer columns): the saved
// "navigation" setting merged over the built-in default. Never throws.
export const loadNavigationConfig = async () => mergeNavigation(await fetchNavigationSettings());

// Everything the header and footer need, in plain serialisable form.
// `config` = { primary, footer } from the central navigation setting.
export async function loadNavigation(locale) {
  const [services, categories, industries, cases, guides, schemes, config] = await Promise.all([
    settle(fetchServices(locale), []),
    loadCategoryGroups(locale),
    loadIndustries(),
    loadCaseStudies({ limit: 4 }),
    loadGuides({ limit: 4 }),
    loadFeaturedSchemes({ limit: 4 }),
    loadNavigationConfig(),
  ]);
  return { services, categories, industries, cases, guides, schemes, config };
}
