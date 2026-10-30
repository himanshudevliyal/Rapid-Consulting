import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every session, inactive ones included -> { total, page, limit, totalPages, data: [...] }
export const fetchSessions = async (searchParams = "") => {
  return await http().get(`${endpoints.sessions.list}?${searchParams}`);
};

// One session (the record itself, with its computed `state`).
export const fetchSession = async (id) => {
  return await http().get(`${endpoints.sessions.getAll}/${id}`);
};

export const createSession = async (data) => {
  return await http().post(endpoints.sessions.getAll, data);
};

export const updateSession = async (id, data) => {
  return await http().put(`${endpoints.sessions.getAll}/${id}`, data);
};

export const deleteSession = async (id) => {
  return await http().delete(`${endpoints.sessions.getAll}/${id}`);
};
