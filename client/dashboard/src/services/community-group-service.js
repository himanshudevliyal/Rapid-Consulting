import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every group, inactive ones included -> [...] (or { data, total, ... })
export const fetchCommunityGroups = async (searchParams = "") => {
  return await http().get(`${endpoints.communityGroups.list}?${searchParams}`);
};

// One group (the record itself).
export const fetchCommunityGroup = async (id) => {
  return await http().get(`${endpoints.communityGroups.getAll}/${id}`);
};

export const createCommunityGroup = async (data) => {
  return await http().post(endpoints.communityGroups.getAll, data);
};

export const updateCommunityGroup = async (id, data) => {
  return await http().put(`${endpoints.communityGroups.getAll}/${id}`, data);
};

export const deleteCommunityGroup = async (id) => {
  return await http().delete(`${endpoints.communityGroups.getAll}/${id}`);
};
