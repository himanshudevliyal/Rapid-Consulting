import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createQuery,
  deleteQuery,
  fetchQueries,
  fetchQuery,
  updateQuery,
} from "@/services/query-service";

export const useQueries = (searchParams = "", options = {}) => {
  return useQuery({
    queryKey: ["queries", searchParams],
    queryFn: () => fetchQueries(searchParams),
    ...options,
  });
};

export const useFormattedQueries = (searchParams = "") => {
  return useQuery({
    queryKey: ["queries", searchParams],
    queryFn: () => fetchQueries(searchParams),
    select: ({ queries }) => {
      return queries?.map((q) => ({
        value: q.id,
        label: q.title ?? q.subject ?? q.name ?? "Untitled",
      }));
    },
  });
};

export const useQueryItem = (id) => {
  return useQuery({
    queryKey: ["queries", id],
    queryFn: () => fetchQuery(id),
    enabled: !!id,
  });
};

export const useCreateQuery = (callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      callback?.();
    },
  });
};

export const useUpdateQuery = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["queries", id],
    mutationFn: (data) => updateQuery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      callback?.();
    },
  });
};

export const useDeleteQuery = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["queries", id],
    mutationFn: () => deleteQuery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      callback?.();
    },
  });
};
