import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchCaseStudies = async (searchParams) => {
  const { data } = await http().get(`${endpoints.caseStudies.getAll}?${searchParams}`);
  return data;
};

export const fetchCaseStudy = async (id) => {
  const { data } = await http().get(`${endpoints.caseStudies.getAll}/${id}`);
  return data;
};

export const createCaseStudy = async (data) => {
  const response = await http().post(endpoints.caseStudies.getAll, data, true);
  return response.data;
};

export const updateCaseStudy = async (id, data) => {
  return await http().put(`${endpoints.caseStudies.getAll}/${id}`, data, true);
};

export const deleteCaseStudy = async (id) => {
  return await http().delete(`${endpoints.caseStudies.getAll}/${id}`);
};
