import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createService,
  deleteService,
  deleteServiceTranslation,
  fetchServices,
  fetchService,
  updateService,
} from "@/services/service-service";

export const useServices = (searchParams = "") => {
  return useQuery({
    queryKey: ["services", "list", searchParams],
    queryFn: () => fetchServices(searchParams),
  });
};

// Returns the service itself with all its translations (not the API envelope).
export const useService = (id) => {
  return useQuery({
    queryKey: ["services", "one", id],
    queryFn: () => fetchService(id),
    select: (response) => response?.data,
    enabled: !!id,
  });
};

export const useCreateService = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service-formats"] });
      queryClient.invalidateQueries({ queryKey: ["service-family-topics"] });
      callback?.();
    },
  });
};

export const useUpdateService = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["services", id],
    mutationFn: (data) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service-formats"] });
      queryClient.invalidateQueries({ queryKey: ["service-family-topics"] });
      callback?.();
    },
  });
};

export const useDeleteService = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["services", id],
    mutationFn: () => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service-formats"] });
      queryClient.invalidateQueries({ queryKey: ["service-family-topics"] });
      callback?.();
    },
  });
};

export const useDeleteServiceTranslation = (id, locale, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["services", id, "translation", locale],
    mutationFn: () => deleteServiceTranslation(id, locale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      callback?.();
    },
  });
};
