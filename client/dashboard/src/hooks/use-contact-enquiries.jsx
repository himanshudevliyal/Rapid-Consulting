import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteContactEnquiry,
  fetchContactEnquiries,
  fetchContactEnquiry,
  updateContactEnquiry,
} from "@/services/contact-enquiry-service";

export const useContactEnquiries = (searchParams = "") => {
  return useQuery({
    queryKey: ["contact-enquiries", searchParams],
    queryFn: () => fetchContactEnquiries(searchParams),
  });
};

export const useContactEnquiry = (id) => {
  return useQuery({
    queryKey: ["contact-enquiries", id],
    queryFn: () => fetchContactEnquiry(id),
    enabled: !!id,
  });
};

export const useUpdateContactEnquiry = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["contact-enquiries", id],
    mutationFn: (data) => updateContactEnquiry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-enquiries"] });
      callback?.();
    },
  });
};

export const useDeleteContactEnquiry = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["contact-enquiries", id],
    mutationFn: () => deleteContactEnquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-enquiries"] });
      callback?.();
    },
  });
};
