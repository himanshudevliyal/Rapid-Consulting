import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIndustry,
  deleteIndustry,
  fetchIndustries,
  fetchIndustry,
  fetchSchemeOptions,
  fetchServiceOptions,
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

// Services and schemes that can be linked from an industry page.
export const useServiceOptions = () =>
  useQuery({ queryKey: ["industry-options", "services"], queryFn: fetchServiceOptions, staleTime: 60_000 });

export const useSchemeOptions = () =>
  useQuery({ queryKey: ["industry-options", "schemes"], queryFn: fetchSchemeOptions, staleTime: 60_000 });
