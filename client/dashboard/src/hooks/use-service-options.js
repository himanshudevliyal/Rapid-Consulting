import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { familyTopicApi, formatApi } from "@/services/service-option-service";

// One set of hooks per option list. Data is { status, data, total, ... }.
const makeOptionHooks = (key, api) => {
  const useList = (searchParams = "") =>
    useQuery({
      queryKey: [key, "list", searchParams],
      queryFn: () => api.list(searchParams),
    });

  // Every option (no paging) for dropdowns. Services are refreshed too, because
  // their list shows the option's name.
  const useAll = () =>
    useQuery({
      queryKey: [key, "all"],
      queryFn: () => api.list(""),
      staleTime: 60 * 1000,
    });

  const useOne = (id) =>
    useQuery({
      queryKey: [key, "one", id],
      queryFn: () => api.get(id),
      enabled: !!id,
    });

  const useCreate = (callback) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        callback?.();
      },
    });
  };

  const useUpdate = (id, callback) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: [key, id],
      mutationFn: (data) => api.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        queryClient.invalidateQueries({ queryKey: ["services"] });
        callback?.();
      },
    });
  };

  const useDelete = (id, callback) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: [key, id],
      mutationFn: () => api.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        callback?.();
      },
    });
  };

  return { useList, useAll, useOne, useCreate, useUpdate, useDelete };
};

export const formatHooks = makeOptionHooks("service-formats", formatApi);
export const familyTopicHooks = makeOptionHooks("service-family-topics", familyTopicApi);

export const {
  useList: useServiceFormats,
  useAll: useAllServiceFormats,
  useOne: useServiceFormat,
  useCreate: useCreateServiceFormat,
  useUpdate: useUpdateServiceFormat,
  useDelete: useDeleteServiceFormat,
} = formatHooks;

export const {
  useList: useServiceFamilyTopics,
  useAll: useAllServiceFamilyTopics,
  useOne: useServiceFamilyTopic,
  useCreate: useCreateServiceFamilyTopic,
  useUpdate: useUpdateServiceFamilyTopic,
  useDelete: useDeleteServiceFamilyTopic,
} = familyTopicHooks;
