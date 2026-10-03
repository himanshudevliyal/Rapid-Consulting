import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchJobs = async (searchParams) => {
  const { data } = await http().get(`${endpoints.jobs.getAll}?${searchParams}`);
  return data;
};

export const fetchJob = async (id) => {
  const { data } = await http().get(`${endpoints.jobs.getAll}/${id}`);
  return data;
};

export const createJob = async (data) => {
  const response = await http().post(endpoints.jobs.getAll, data);
  return response.data;
};

export const updateJob = async (id, data) => {
  return await http().put(`${endpoints.jobs.getAll}/${id}`, data);
};

export const deleteJob = async (id) => {
  return await http().delete(`${endpoints.jobs.getAll}/${id}`);
};
