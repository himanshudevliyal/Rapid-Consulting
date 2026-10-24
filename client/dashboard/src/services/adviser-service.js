import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every adviser, hidden ones included -> [...]
export const fetchAdvisers = async (searchParams = "") => {
  return await http().get(`${endpoints.advisers.list}?${searchParams}`);
};

// One adviser (the record itself).
export const fetchAdviser = async (id) => {
  return await http().get(`${endpoints.advisers.getAll}/${id}`);
};

export const createAdviser = async (data) => {
  return await http().post(endpoints.advisers.getAll, data);
};

export const updateAdviser = async (id, data) => {
  return await http().put(`${endpoints.advisers.getAll}/${id}`, data);
};

export const deleteAdviser = async (id) => {
  return await http().delete(`${endpoints.advisers.getAll}/${id}`);
};
