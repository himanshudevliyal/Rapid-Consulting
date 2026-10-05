import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchSchemes = async (searchParams) => {
  return await http().get(`${endpoints.schemes.getAll}?${searchParams}`);
};
export const fetchScheme = async (id) => {
return await http().get(`${endpoints.schemes.getAll}/${id}`);
  // return data;
};

export const createScheme = async (data) => {
  const response = await http().post(endpoints.schemes.getAll, data);
   response.data;
};

export const updateScheme = async (id, data) => {
  return await http().put(`${endpoints.schemes.getAll}/${id}`, data);
};

export const deleteScheme = async (id) => {
  return await http().delete(`${endpoints.schemes.getAll}/${id}`);
};
