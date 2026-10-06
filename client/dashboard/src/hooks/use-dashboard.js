import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// The list endpoints answer in different shapes ({ total, data: [] },
// { data: { services: [], total } }, a bare array ...). This turns any of
// them into { rows, total } so the dashboard reads them all the same way.
export const normalizeList = (body) => {
  const inner =
    body && typeof body === "object" && !Array.isArray(body) && "data" in body ? body.data : body;

  let rows = [];
  if (Array.isArray(inner)) rows = inner;
  else if (inner && typeof inner === "object") rows = Object.values(inner).find(Array.isArray) ?? [];

  const total = [body?.total, inner?.total].find((value) => Number.isFinite(value)) ?? rows.length;
  return { rows, total };
};

const fetchList = async (path, params = {}) => {
  const search = new URLSearchParams(params).toString();
  return normalizeList(await http().get(`${path}?${search}`));
};

const useList = (key, path, params) =>
  useQuery({
    queryKey: ["dashboard", key],
    queryFn: () => fetchList(path, params),
    staleTime: 60 * 1000,
  });

// Everything the dashboard page shows. Every entry is its own query, so one
// failing endpoint only affects its own card or chart.
export const useDashboardData = () => ({
  // Up to 200 rows: enough for the counts and the charts, which are worked
  // out in the browser.
  services: useList("services", endpoints.services.getAll, { limit: 200, include_inactive: "true" }),
  enquiries: useList("enquiries", endpoints.enquiries.getAll, { limit: 200 }),
  newEnquiries: useList("enquiries-new", endpoints.enquiries.getAll, { limit: 1, status: "new" }),
  queries: useList("queries", endpoints.queries.getAll, { limit: 200 }),

  schemes: useList("schemes", endpoints.schemes.list, { limit: 1 }),
  schemesPublished: useList("schemes-published", endpoints.schemes.list, { limit: 1, is_published: "true" }),
  articles: useList("articles", endpoints.articles.list, { limit: 1 }),
  articlesPublished: useList("articles-published", endpoints.articles.list, { limit: 1, is_published: "true" }),
  caseStudies: useList("case-studies", endpoints.caseStudies.list, { limit: 1 }),
  caseStudiesPublished: useList("case-studies-published", endpoints.caseStudies.list, {
    limit: 1,
    is_published: "true",
  }),

  categories: useList("categories", endpoints.categories.getAll, { limit: 1 }),
  users: useList("users", endpoints.users.getAll, { limit: 1 }),
});
