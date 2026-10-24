import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";

// "Request a callback" form -> POST /enquiries. Resolves { id, success }.
// payload: name, phone (required), email, location, requirement, subject,
// service_name, page_title, page_url, page_id, source.
export const submitEnquiry = (payload) => http().post(endpoints.enquiries.create, payload);

// Contact-us form -> POST /queries. payload: name, email, phone (10 digits),
// subject, reason, message, attachment.
export const submitQuery = (payload) => http().post(endpoints.queries.create, payload);

// Contact Us form -> POST /contact-enquiries (its own table). Resolves { id, success }.
// payload: name, email, phone, message (required), location, subject,
// page_title, page_url, page_id, source.
export const submitContactEnquiry = (payload) => http().post(endpoints.contactEnquiries.create, payload);
