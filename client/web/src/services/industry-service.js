import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";
import { orNull } from "@/utils/api-helpers";

// Cache tag refreshed by POST /api/revalidate when an industry is saved.
export const INDUSTRIES_TAG = "industries";
export const industryTag = (slug) => `industry:${slug}`;

// Every active industry (the API returns a plain array, without the long
// body): [{ id, name, slug, description, image, service_slugs, scheme_slugs… }].
// Shaped like the other lists: { items, total }.
export const fetchAllIndustries = async (params = {}, options) => {
  const body = await http().get(endpoints.industries.getAll, options);
  const items = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  return { items, total: items.length, page: 1, limit: items.length, totalPages: 1 };
};

// One industry with `services` and `schemes` (the ones chosen for its page),
// or null when the slug is unknown / inactive.
export const fetchIndustryBySlug = (slug, options) =>
  orNull(http().get(`${endpoints.industries.getBySlug}/${encodeURIComponent(slug)}`, options));
