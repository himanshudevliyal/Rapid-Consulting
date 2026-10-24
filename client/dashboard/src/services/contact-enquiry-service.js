import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Contact Us messages (table `contact_enquiries`). Submitted from the website;
// the admin only reads them and updates status / notes, or deletes them.

// List -> { total, page, limit, totalPages, data: [...] }
export const fetchContactEnquiries = async (searchParams = "") => {
  return await http().get(`${endpoints.contactEnquiries.getAll}?${searchParams}`);
};

// One message (the record itself).
export const fetchContactEnquiry = async (id) => {
  return await http().get(`${endpoints.contactEnquiries.getAll}/${id}`);
};

// data: { status, notes }
export const updateContactEnquiry = async (id, data) => {
  return await http().patch(`${endpoints.contactEnquiries.getAll}/${id}`, data);
};

export const deleteContactEnquiry = async (id) => {
  return await http().delete(`${endpoints.contactEnquiries.getAll}/${id}`);
};
