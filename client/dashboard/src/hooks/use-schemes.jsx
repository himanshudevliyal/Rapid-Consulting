import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createScheme,
  deleteScheme,
  fetchSchemes,
  fetchScheme,
  updateScheme,
} from "@/services/scheme-service";

export const useSchemes = (searchParams = "") => {
  return useQuery({
    queryKey: ["schemes", searchParams],
    queryFn: () => fetchSchemes(searchParams),
  });
};

export const useScheme = (id) => {
  return useQuery({
    queryKey: ["schemes", id],
    queryFn: () => fetchScheme(id),
    enabled: !!id,
  });
};

export const useCreateScheme = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      callback?.();
    },
  });
};

export const useUpdateScheme = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["schemes", id],
    mutationFn: (data) => updateScheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      callback?.();
    },
  });
};

export const useDeleteScheme = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["schemes", id],
    mutationFn: () => deleteScheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      callback?.();
    },
  });
};
