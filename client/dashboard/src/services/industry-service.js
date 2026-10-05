import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchIndustries = async (searchParams) => {
 return await http().get(`${endpoints.industries.getAll}?${searchParams}`);
};

export const fetchIndustry = async (id) => {
  const { data } = await http().get(`${endpoints.industries.getAll}/${id}`);
  return data;
};

export const createIndustry = async (data) => {
  const response = await http().post(endpoints.industries.getAll, data, true);
  return response.data;
};

export const updateIndustry = async (id, data) => {
  return await http().put(`${endpoints.industries.getAll}/${id}`, data, true);
};

export const deleteIndustry = async (id) => {
  return await http().delete(`${endpoints.industries.getAll}/${id}`);
};
