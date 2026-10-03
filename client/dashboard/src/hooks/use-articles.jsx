import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createArticle,
  deleteArticle,
  fetchArticles,
  fetchArticle,
  updateArticle,
} from "@/services/article-service";

export const useArticles = (searchParams = "") => {
  return useQuery({
    queryKey: ["articles", searchParams],
    queryFn: () => fetchArticles(searchParams),
  });
};

export const useArticle = (id) => {
  return useQuery({
    queryKey: ["articles", id],
    queryFn: () => fetchArticle(id),
    enabled: !!id,
  });
};

export const useCreateArticle = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      callback?.();
    },
  });
};

export const useUpdateArticle = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["articles", id],
    mutationFn: (data) => updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      callback?.();
    },
  });
};

export const useDeleteArticle = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["articles", id],
    mutationFn: () => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      callback?.();
    },
  });
};
