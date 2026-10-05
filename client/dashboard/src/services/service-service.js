import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchServices = async (searchParams) => {
  return await http().get(`${endpoints.services.getAll}?${searchParams}`);
};

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
