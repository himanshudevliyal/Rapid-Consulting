import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEnquiry,
  deleteEnquiry,
  fetchEnquiries,
  fetchEnquiry,
  updateEnquiry,
} from "@/services/enquiry-service";

export const useEnquiries = (searchParams = "") => {
  return useQuery({
    queryKey: ["enquiries", searchParams],
    queryFn: () => fetchEnquiries(searchParams),
  });
};

export const useEnquiry = (id) => {
  return useQuery({
    queryKey: ["enquiries", id],
    queryFn: () => fetchEnquiry(id),
    enabled: !!id,
  });
};

export const useCreateEnquiry = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEnquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      callback?.();
    },
  });
};

export const useUpdateEnquiry = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["enquiries", id],
    mutationFn: (data) => updateEnquiry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      callback?.();
    },
  });
};

export const useDeleteEnquiry = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["enquiries", id],
    mutationFn: () => deleteEnquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      callback?.();
    },
  });
};
