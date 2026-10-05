import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createService,
  deleteService,
  fetchServices,
  fetchService,
  updateService,
} from "@/services/service-service";

export const useServices = (searchParams = "") => {
  return useQuery({
    queryKey: ["services", searchParams],
    queryFn: () => fetchServices(searchParams),
  });
};

export const useService = (id) => {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => fetchService(id),
    enabled: !!id,
  });
};

export const useCreateService = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
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
      callback?.();
    },
  });
};
