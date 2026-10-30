import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";
import { orNull } from "@/utils/api-helpers";

// Cache tag refreshed by POST /api/revalidate when a team member is saved.
export const ADVISERS_TAG = "advisers";
export const adviserTag = (slug) => `adviser:${slug}`;

// Every active adviser (the people on the About page), in display order. The
// API returns a plain array; shaped like the other lists: { items, total }.
export const fetchAllAdvisers = async (options) => {
  const body = await http().get(endpoints.advisers.getAll, options);
  const items = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  return { items, total: items.length, page: 1, limit: items.length, totalPages: 1 };
};

// One person for the profile page, or null when the slug is unknown / hidden.
export const fetchAdviserBySlug = (slug, options) =>
  orNull(http().get(`${endpoints.advisers.getBySlug}/${encodeURIComponent(slug)}`, options));
