import http, { isNotFound } from "@/utils/http";
import { endpoints } from "@/utils/endpoints";
import { buildQuery, orNull } from "@/utils/api-helpers";

// Pages composed in the admin panel from reusable sections (table
// `site_pages`). Cache tags are refreshed by POST /api/revalidate
// ({ tag: "site-pages", slugs: [path] }) when a page is published, unpublished
// or deleted.
export const SITE_PAGES_TAG = "site-pages";

// Paths travel without a leading slash ("your-project/setting-up").
export const cleanSitePath = (path = "") =>
  String(path ?? "")
    .split("?")[0]
    .replace(/^\/+|\/+$/g, "");

export const sitePageTag = (path) => `site-page:${cleanSitePath(path)}`;

// The API answers either with the record itself or wrapped as { data }.
const unwrap = (body, probe) => {
  if (body && typeof body === "object" && !(probe in body) && body.data && typeof body.data === "object") {
    return body.data;
  }
  return body ?? null;
};

// The published page at a path in a language, or null (unknown / not published).
export const fetchSitePageByPath = async (path, locale, options) =>
  unwrap(
    await orNull(http().get(`${endpoints.sitePages.byPath}${buildQuery({ path: cleanSitePath(path), locale })}`, options)),
    "sections",
  );

// Published pages (id, page_key, group_id, template, locale, path, title, updated_at).
export const fetchSitePageList = async (params = {}, options) => {
  const body = await http().get(`${endpoints.sitePages.getAll}${buildQuery(params)}`, options);
  if (Array.isArray(body)) return body;
  return Array.isArray(body?.data) ? body.data : [];
};

// The block registry: which blocks sit in the enquiry rail, template layouts…
export const fetchSitePageRegistry = async (options) =>
  unwrap(await http().get(endpoints.sitePages.registry, options), "blocks");

// A draft page for the editor's preview. A bad or expired token (401) and an
// unknown id (404) both give null. Never cached.
export const fetchSitePagePreview = async (id, token) => {
  try {
    const body = await http().get(
      `${endpoints.sitePages.preview}/${encodeURIComponent(id)}${buildQuery({ token })}`,
      { cache: "no-store" },
    );
    return unwrap(body, "sections");
  } catch (error) {
    const status = error?.response?.status;
    if (isNotFound(error) || status === 401 || status === 403 || status === 400) return null;
    throw error;
  }
};
