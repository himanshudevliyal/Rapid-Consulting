import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCaseStudy,
  deleteCaseStudy,
  fetchCaseStudies,
  fetchCaseStudy,
  updateCaseStudy,
} from "@/services/case-study-service";

export const useCaseStudies = (searchParams = "") => {
  return useQuery({
    queryKey: ["case-studies", searchParams],
    queryFn: () => fetchCaseStudies(searchParams),
  });
};

export const useCaseStudy = (id) => {
  return useQuery({
    queryKey: ["case-studies", id],
    queryFn: () => fetchCaseStudy(id),
    enabled: !!id,
  });
};

export const useCreateCaseStudy = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCaseStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-studies"] });
      callback?.();
    },
  });
};

export const useUpdateCaseStudy = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["case-studies", id],
    mutationFn: (data) => updateCaseStudy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-studies"] });
      callback?.();
    },
  });
};

export const useDeleteCaseStudy = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["case-studies", id],
    mutationFn: () => deleteCaseStudy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-studies"] });
      callback?.();
    },
  });
};
