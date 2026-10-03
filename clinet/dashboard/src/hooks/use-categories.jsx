import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategory,
  updateCategory,
} from "@/services/category-service";

export const useCategories = (searchParams = "") => {
  return useQuery({
    queryKey: ["categories", searchParams],
    queryFn: () => fetchCategories(searchParams),
  });
};
export const useFormattedCategories = (searchParams = "", options = {}) => {
  return useQuery({
    queryKey: ["categories", searchParams],
    queryFn: () => fetchCategories(searchParams),
    select: ({ categories }) => {
      return categories?.map((b) => ({
        value: b.id,
        label: b.title,
      }));
    },
    ...options,
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      callback?.();
    },
  });
};

export const useUpdateCategory = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["categories", id],
    mutationFn: (data) => updateCategory(id, data),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      callback?.();
    },
  });
};

export const useDeleteCategory = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["categories", id],
    mutationFn: () => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      callback?.();
    },
  });
};
