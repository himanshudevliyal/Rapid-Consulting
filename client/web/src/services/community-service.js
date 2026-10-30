import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";
import { buildQuery } from "@/utils/api-helpers";

// WhatsApp community groups. Cache tag refreshed by POST /api/revalidate
// when a group is saved in the admin panel.
export const COMMUNITY_TAG = "community-groups";

// Active groups in display order; `placement` ("industries" | "resources" |
// "advisers" | "home") keeps the ones meant for that part of the site.
// The API returns a plain array; shaped like the other lists: { items, total }.
export const fetchCommunityGroups = async (params = {}, options) => {
  const body = await http().get(`${endpoints.communityGroups.getAll}${buildQuery(params)}`, options);
  const items = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  return { items, total: items.length, page: 1, limit: items.length, totalPages: 1 };
};
