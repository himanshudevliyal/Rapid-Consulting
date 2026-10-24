import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Service / callback enquiries (table `enquiries`). Submitted from the website;
// the admin only reads them and updates status / notes, or deletes them.

// List -> { total, page, limit, totalPages, data: [...] }
export const fetchEnquiries = async (searchParams = "") => {
  return await http().get(`${endpoints.enquiries.getAll}?${searchParams}`);
};

// One enquiry (the record itself).
export const fetchEnquiry = async (id) => {
  return await http().get(`${endpoints.enquiries.getAll}/${id}`);
};

// data: { status, notes }
export const updateEnquiry = async (id, data) => {
  return await http().patch(`${endpoints.enquiries.getAll}/${id}`, data);
};

export const deleteEnquiry = async (id) => {
  return await http().delete(`${endpoints.enquiries.getAll}/${id}`);
};
