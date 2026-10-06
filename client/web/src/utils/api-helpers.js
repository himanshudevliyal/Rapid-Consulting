import config from "@/config";
import { isNotFound } from "@/utils/http";

// Query string from an object; empty / null values are left out.
export const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

// Next.js fetch-cache options for server components: cached for a few minutes
// and refreshable by tag from POST /api/revalidate.
export const cachedFor = (...tags) => ({
  next: { revalidate: config.content_revalidate_seconds, tags },
});

// 404 -> null (unknown or unpublished slug); every other error is thrown.
export const orNull = (promise) =>
  promise.catch((error) => (isNotFound(error) ? null : Promise.reject(error)));

// { total, page, limit, totalPages, data } -> { items, total, page, limit, totalPages }
export const normalizeList = (body) => {
  const items = Array.isArray(body?.data) ? body.data : [];
  return {
    items,
    total: body?.total ?? items.length,
    page: body?.page ?? 1,
    limit: body?.limit ?? items.length,
    totalPages: body?.totalPages ?? 1,
  };
};

// Reads every page of a list (public lists are paged, 100 at a time).
export const fetchEveryPage = async (fetchPage, { limit = 100, maxPages = 20 } = {}) => {
  const first = await fetchPage(1, limit);
  const items = [...first.items];
  for (let page = 2; page <= Math.min(first.totalPages, maxPages); page++) {
    items.push(...(await fetchPage(page, limit)).items);
  }
  return { ...first, items, total: first.total, page: 1, limit, totalPages: 1 };
};

// Readable message from an API error ({ message } | { error } | network).
export const apiErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.response?.data?.message ?? error?.response?.data?.error ?? (error?.response ? fallback : error?.message) ?? fallback;
