import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every case study, drafts included -> { total, page, limit, totalPages, data: [...] }
export const fetchCaseStudies = async (searchParams) => {
  return await http().get(`${endpoints.caseStudies.list}?${searchParams}`);
};

// One case study (the record itself).
export const fetchCaseStudy = async (id) => {
  return await http().get(`${endpoints.caseStudies.getAll}/${id}`);
};

export const createCaseStudy = async (data) => {
  return await http().post(endpoints.caseStudies.getAll, data);
};

export const updateCaseStudy = async (id, data) => {
  return await http().put(`${endpoints.caseStudies.getAll}/${id}`, data);
};

export const deleteCaseStudy = async (id) => {
  return await http().delete(`${endpoints.caseStudies.getAll}/${id}`);
};
