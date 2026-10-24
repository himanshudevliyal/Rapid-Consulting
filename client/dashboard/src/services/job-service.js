import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every job, closed ones included -> { total, page, limit, totalPages, data: [...] }
export const fetchJobs = async (searchParams = "") => {
  return await http().get(`${endpoints.jobs.list}?${searchParams}`);
};

// One job (the record itself).
export const fetchJob = async (id) => {
  return await http().get(`${endpoints.jobs.getAll}/${id}`);
};

export const createJob = async (data) => {
  return await http().post(endpoints.jobs.getAll, data);
};

export const updateJob = async (id, data) => {
  return await http().put(`${endpoints.jobs.getAll}/${id}`, data);
};

export const deleteJob = async (id) => {
  return await http().delete(`${endpoints.jobs.getAll}/${id}`);
};
