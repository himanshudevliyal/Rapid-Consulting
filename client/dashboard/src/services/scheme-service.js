import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every scheme, drafts included.
export const fetchSchemes = async (searchParams) => {
  return await http().get(`${endpoints.schemes.list}?${searchParams}`);
};

// One scheme (the record itself).
export const fetchScheme = async (id) => {
  return await http().get(`${endpoints.schemes.getAll}/${id}`);
};

export const createScheme = async (data) => {
  return await http().post(endpoints.schemes.getAll, data);
};

export const updateScheme = async (id, data) => {
  return await http().put(`${endpoints.schemes.getAll}/${id}`, data);
};

export const deleteScheme = async (id) => {
  return await http().delete(`${endpoints.schemes.getAll}/${id}`);
};
