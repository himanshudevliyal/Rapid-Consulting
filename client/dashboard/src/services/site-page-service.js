import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const base = endpoints.sitePages.getAll;

// Blocks and templates the editor offers (the server is the single source).
export const fetchSitePageRegistry = async () => {
  return await http().get(endpoints.sitePages.registry);
};

// Admin list (no sections) -> { total, page, limit, totalPages, data: [...] }
export const fetchSitePages = async (searchParams = "") => {
  return await http().get(`${endpoints.sitePages.list}?${searchParams}`);
};

// One page with its sections, published_sections and counterparts.
export const fetchSitePage = async (id) => {
  return await http().get(`${base}/${id}`);
};

export const createSitePage = async (data) => {
  return await http().post(base, data);
};

export const updateSitePage = async (id, data) => {
  return await http().put(`${base}/${id}`, data);
};

export const deleteSitePage = async (id) => {
  return await http().delete(`${base}/${id}`);
};

export const submitSitePageForReview = async (id) => {
  return await http().post(`${base}/${id}/submit-review`, {});
};

export const publishSitePage = async (id) => {
  return await http().post(`${base}/${id}/publish`, {});
};

export const unpublishSitePage = async (id) => {
  return await http().post(`${base}/${id}/unpublish`, {});
};

// Creates the other-language counterpart of a page (same group, draft).
export const createSitePageTranslation = async (id, locale) => {
  return await http().post(`${base}/${id}/translation`, { locale });
};

export const fetchSitePageRevisions = async (id) => {
  return await http().get(`${base}/${id}/revisions`);
};

export const fetchSitePageRevision = async (id, revisionId) => {
  return await http().get(`${base}/${id}/revisions/${revisionId}`);
};

export const restoreSitePageRevision = async (id, revisionId) => {
  return await http().post(`${base}/${id}/restore/${revisionId}`, {});
};

// -> { token, expires_at, url_path }
export const createSitePagePreviewToken = async (id) => {
  return await http().post(`${base}/${id}/preview-token`, {});
};
