import {
  useContactEnquiries,
  useContactEnquiry,
  useDeleteContactEnquiry,
  useUpdateContactEnquiry,
} from "@/hooks/use-contact-enquiries";
import {
  useDeleteEnquiry,
  useEnquiries,
  useEnquiry,
  useUpdateEnquiry,
} from "@/hooks/use-enquiries";

// The two kinds of enquiry share one list / detail screen:
//   "enquiry" - service / callback forms of the website (table `enquiries`)
//   "contact" - the Contact Us form (table `contact_enquiries`)
export const ENQUIRY_KINDS = {
  enquiry: {
    title: "Service Enquiries",
    singular: "Enquiry",
    description: "Callback and service enquiries sent from the website's pages.",
    listUrl: "/enquiries?page=1&limit=10",
    editUrl: (id) => `/enquiries/${id}/edit`,
    searchKey: "name, phone, service or page",
    sources: [
      { value: "callback-rail", label: "Service page form" },
      { value: "contact-section", label: "Page form (bottom)" },
      { value: "contact-form", label: "Contact form (older)" },
    ],
    useList: useEnquiries,
    useItem: useEnquiry,
    useUpdate: useUpdateEnquiry,
    useDelete: useDeleteEnquiry,
  },
  contact: {
    title: "Contact Enquiries",
    singular: "Contact enquiry",
    description: "Messages sent with the Contact Us form of the website.",
    listUrl: "/contact-enquiries?page=1&limit=10",
    editUrl: (id) => `/contact-enquiries/${id}/edit`,
    searchKey: "name, email, phone or message",
    sources: [{ value: "contact-page", label: "Contact page" }],
    useList: useContactEnquiries,
    useItem: useContactEnquiry,
    useUpdate: useUpdateContactEnquiry,
    useDelete: useDeleteContactEnquiry,
  },
};

export const sourceLabel = (kind, value) =>
  ENQUIRY_KINDS[kind].sources.find((source) => source.value === value)?.label ?? value ?? "-";
