import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAdviser,
  deleteAdviser,
  fetchAdvisers,
  fetchAdviser,
  updateAdviser,
} from "@/services/adviser-service";

export const useAdvisers = (searchParams = "") => {
  return useQuery({
    queryKey: ["advisers", searchParams],
    queryFn: () => fetchAdvisers(searchParams),
  });
};

export const useAdviser = (id) => {
  return useQuery({
    queryKey: ["advisers", id],
    queryFn: () => fetchAdviser(id),
    enabled: !!id,
  });
};

export const useCreateAdviser = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdviser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisers"] });
      callback?.();
    },
  });
};

export const useUpdateAdviser = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["advisers", id],
    mutationFn: (data) => updateAdviser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisers"] });
      callback?.();
    },
  });
};

export const useDeleteAdviser = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["advisers", id],
    mutationFn: () => deleteAdviser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisers"] });
      callback?.();
    },
  });
};

// Advisers as { value, label } options for the Author / Reviewer pickers.
// Uses the same cache entry as the advisers list; the API returns an array
// (or { data: [...] }).
export const useAdviserOptions = () => {
  const query = useAdvisers("");
  const rows = Array.isArray(query.data) ? query.data : (query.data?.data ?? []);
  const options = rows.map((row) => {
    const parts = [row.name, row.designation].filter(Boolean);
    const label = parts.join(" - ") + (row.is_placeholder ? " (placeholder)" : "");
    return { value: String(row.id), label };
  });
  return { ...query, options };
};
