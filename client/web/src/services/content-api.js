import http from "@/utils/http";
import { buildQuery, fetchEveryPage, normalizeList, orNull } from "@/utils/api-helpers";

// Public list + detail calls shared by articles, case studies and schemes.
// Every function takes an optional last `options` argument: server components
// pass `cachedFor(tag)` there, browser hooks leave it out.
export const createContentApi = ({ getAll, getBySlug }) => ({
  // One page: { items, total, page, limit, totalPages }. params: q, tag, category_id, page, limit
  list: async (params = {}, options) =>
    normalizeList(await http().get(`${getAll}${buildQuery(params)}`, options)),

  // Every published record (all pages).
  all: (params = {}, options) =>
    fetchEveryPage(async (page, limit) =>
      normalizeList(await http().get(`${getAll}${buildQuery({ ...params, page, limit })}`, options)),
    ),

  // The record itself, or null when the slug is unknown / not published.
  bySlug: (slug, options) => orNull(http().get(`${getBySlug}/${encodeURIComponent(slug)}`, options)),
});
