import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBlog,
  deleteBlog,
  fetchBlogs,
  fetchBlog,
  updateBlog,
} from "@/services/blog-service";

export const useBlogs = (searchParams = "") => {
  return useQuery({
    queryKey: ["blogs", searchParams],
    queryFn: () => fetchBlogs(searchParams),
  });
};

export const useFormattedBlogs = (searchParams = "") => {
  return useQuery({
    queryKey: ["blogs", searchParams],
    queryFn: () => fetchBlogs(searchParams),
    select: ({ blogs }) => blogs?.map((b) => ({ value: b.id, label: b.title })),
  });
};

export const useBlog = (id) => {
  return useQuery({
    queryKey: ["blogs", id],
    queryFn: () => fetchBlog(id),
    enabled: !!id,
  });
};

export const useCreateBlog = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      callback?.();
    },
  });
};

export const useUpdateBlog = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["blogs", id],
    mutationFn: (data) => updateBlog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      callback?.();
    },
  });
};

export const useDeleteBlog = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["blogs", id],
    mutationFn: () => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      callback?.();
    },
  });
};