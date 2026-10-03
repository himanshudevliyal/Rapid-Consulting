import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSubCategory,
  deleteSubCategory,
  fetchSubCategories,
  fetchSubCategory,
  updateSubCategory,
} from "@/services/sub-category-service";

export const useSubCategories = (searchParams = "") => {
  return useQuery({
    queryKey: ["sub-categories", searchParams],
    queryFn: () => fetchSubCategories(searchParams),
  });
};

export const useFormattedSubCategories = (searchParams = "", options = {}) => {
  return useQuery({
    queryKey: ["sub-categories", searchParams],
    queryFn: () => fetchSubCategories(searchParams),
    select: ({ sub_categories }) => {
      return sub_categories?.map((b) => ({
        value: b.id,
        label: b.title,
      }));
    },
    ...options,
  });
};

export const useSubCategory = (id) => {
  return useQuery({
    queryKey: ["sub-categories", id],
    queryFn: () => fetchSubCategory(id),
    enabled: !!id,
  });
};

export const useCreateSubCategory = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
      callback?.();
    },
  });
};

export const useUpdateSubCategory = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["sub-categories", id],
    mutationFn: (data) => updateSubCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
      callback?.();
    },
  });
};

export const useDeleteSubCategory = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["sub-categories", id],
    mutationFn: () => deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
      callback?.();
    },
  });
};
