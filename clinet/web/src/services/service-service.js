import config from "@/config";
import { endpoints } from "@/utils/endpoints";
import http, { isNotFound } from "@/utils/http";

// Cache tag for everything that comes from /services. POST /api/revalidate
// (called by the API after an admin edit) refreshes it.
export const SERVICES_TAG = "services";

const cached = (...tags) => ({
  next: { revalidate: config.services_revalidate_seconds, tags: [SERVICES_TAG, ...tags] },
});

const query = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

// 404 -> null (unknown slug/code); other errors are thrown.
const orNull = (promise) => promise.catch((error) => (isNotFound(error) ? null : Promise.reject(error)));

// Listed services (families, services, additional services) in one language.
// Each item carries `available_locales` so links only point to real translations.
export const fetchServices = async (locale, params = {}) => {
  const { data } = await http().get(`${endpoints.services.getAll}${query({ locale, ...params })}`, cached());
  return data?.services ?? [];
};

// One service with its sections, family and related services. When the
// language has no translation the API returns English with `is_fallback: true`.
export const fetchServiceBySlug = async (slug, locale) => {
  const body = await orNull(
    http().get(`${endpoints.services.getBySlug}/${encodeURIComponent(slug)}${query({ locale })}`, cached(`service:${slug}`)),
  );
  return body?.data ?? null;
};

// A service record by its stable code, e.g. "S00" (the /services page).
export const fetchServiceByCode = async (code, locale) => {
  const body = await orNull(
    http().get(`${endpoints.services.getByCode}/${encodeURIComponent(code)}${query({ locale })}`, cached()),
  );
  return body?.data ?? null;
};
