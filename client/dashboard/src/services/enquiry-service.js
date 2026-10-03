import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchEnquiries = async (searchParams) => {
  const { data } = await http().get(`${endpoints.enquiries.getAll}?${searchParams}`);
  return data;
};

export const fetchEnquiry = async (id) => {
  const { data } = await http().get(`${endpoints.enquiries.getAll}/${id}`);
  return data;
};

export const createEnquiry = async (data) => {
  const response = await http().post(endpoints.enquiries.getAll, data);
  return response.data;
};

export const updateEnquiry = async (id, data) => {
  return await http().patch(`${endpoints.enquiries.getAll}/${id}`, data);
};

export const deleteEnquiry = async (id) => {
  return await http().delete(`${endpoints.enquiries.getAll}/${id}`);
};
