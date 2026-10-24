import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every industry, hidden ones included.
export const fetchIndustries = async (searchParams = "") => {
  return await http().get(`${endpoints.industries.list}?${searchParams}`);
};

// One industry (the record itself).
export const fetchIndustry = async (id) => {
  return await http().get(`${endpoints.industries.getAll}/${id}`);
};

export const createIndustry = async (data) => {
  return await http().post(endpoints.industries.getAll, data);
};

export const updateIndustry = async (id, data) => {
  return await http().put(`${endpoints.industries.getAll}/${id}`, data);
};

export const deleteIndustry = async (id) => {
  return await http().delete(`${endpoints.industries.getAll}/${id}`);
};

// Options for the "Services" / "Schemes" pickers of the industry form.
export const fetchServiceOptions = async () => {
  const body = await http().get(`${endpoints.services.getAll}?include_inactive=true`);
  return (body?.services ?? [])
    .filter((service) => service.type !== "index")
    .map((service) => ({ value: service.slug, label: service.title }));
};

export const fetchSchemeOptions = async () => {
  const body = await http().get(`${endpoints.schemes.list}?page=1&limit=500`);
  return (body?.data ?? []).map((scheme) => ({ value: scheme.slug, label: scheme.title }));
};
