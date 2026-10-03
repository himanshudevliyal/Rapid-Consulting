import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchSchemes = async (searchParams) => {
  const { data } = await http().get(`${endpoints.schemes.getAll}?${searchParams}`);
  return data;
};

export const fetchScheme = async (id) => {
  const { data } = await http().get(`${endpoints.schemes.getAll}/${id}`);
  return data;
};

export const createScheme = async (data) => {
  const response = await http().post(endpoints.schemes.getAll, data);
  return response.data;
};

export const updateScheme = async (id, data) => {
  return await http().put(`${endpoints.schemes.getAll}/${id}`, data);
};

export const deleteScheme = async (id) => {
  return await http().delete(`${endpoints.schemes.getAll}/${id}`);
};
