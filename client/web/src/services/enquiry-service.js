import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";

// "Request a callback" form -> POST /enquiries. Resolves { id, success }.
// payload: name, phone (required), email, location, requirement, subject,
// page_title, page_id, source.
export const submitEnquiry = (payload) => http().post(endpoints.enquiries.create, payload);

// Contact-us form -> POST /queries. payload: name, email, phone (10 digits),
// subject, reason, message, attachment.
export const submitQuery = (payload) => http().post(endpoints.queries.create, payload);
