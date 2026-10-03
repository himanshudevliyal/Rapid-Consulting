import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIndustry,
  deleteIndustry,
  fetchIndustries,
  fetchIndustry,
  updateIndustry,
} from "@/services/industry-service";

export const useIndustries = (searchParams = "") => {
  return useQuery({
    queryKey: ["industries", searchParams],
    queryFn: () => fetchIndustries(searchParams),
  });
};

export const useIndustry = (id) => {
  return useQuery({
    queryKey: ["industries", id],
    queryFn: () => fetchIndustry(id),
    enabled: !!id,
  });
};

export const useCreateIndustry = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      callback?.();
    },
  });
};

export const useUpdateIndustry = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["industries", id],
    mutationFn: (data) => updateIndustry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      callback?.();
    },
  });
};

export const useDeleteIndustry = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["industries", id],
    mutationFn: () => deleteIndustry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      callback?.();
    },
  });
};
