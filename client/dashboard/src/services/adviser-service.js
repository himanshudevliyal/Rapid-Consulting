import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchAdvisers = async (searchParams) => {
  const { data } = await http().get(`${endpoints.advisers.getAll}?${searchParams}`);
  return data;
};

export const fetchAdviser = async (id) => {
  const { data } = await http().get(`${endpoints.advisers.getAll}/${id}`);
  return data;
};

export const createAdviser = async (data) => {
  const response = await http().post(endpoints.advisers.getAll, data, true);
  return response.data;
};

export const updateAdviser = async (id, data) => {
  return await http().put(`${endpoints.advisers.getAll}/${id}`, data, true);
};

export const deleteAdviser = async (id) => {
  return await http().delete(`${endpoints.advisers.getAll}/${id}`);
};
