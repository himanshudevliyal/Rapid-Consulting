import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// The admin list also shows inactive services (and the /services index page).
export const fetchServices = async (searchParams = "") => {
  const params = new URLSearchParams(searchParams);
  params.set("include_inactive", "true");
  return await http().get(`${endpoints.services.getAll}?${params.toString()}`);
};

// { status, data: { ...service, translations: [...] } }
export const fetchService = async (id) => {
  return await http().get(`${endpoints.services.getAll}/${id}`);
};

export const createService = async (data) => {
  return await http().post(endpoints.services.getAll, data);
};

export const updateService = async (id, data) => {
  return await http().put(`${endpoints.services.getAll}/${id}`, data);
};

export const deleteService = async (id) => {
  return await http().delete(`${endpoints.services.getAll}/${id}`);
};

// Removes one language version (the English version cannot be deleted).
export const deleteServiceTranslation = async (id, locale) => {
  return await http().delete(
    `${endpoints.services.getAll}/${id}/translations/${locale}`,
  );
};
