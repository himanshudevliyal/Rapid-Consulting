import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createJob,
  deleteJob,
  fetchJobs,
  fetchJob,
  updateJob,
} from "@/services/job-service";

export const useJobs = (searchParams = "") => {
  return useQuery({
    queryKey: ["jobs", searchParams],
    queryFn: () => fetchJobs(searchParams),
  });
};

export const useJob = (id) => {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => fetchJob(id),
    enabled: !!id,
  });
};

export const useCreateJob = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      callback?.();
    },
  });
};

export const useUpdateJob = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["jobs", id],
    mutationFn: (data) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      callback?.();
    },
  });
};

export const useDeleteJob = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["jobs", id],
    mutationFn: () => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      callback?.();
    },
  });
};
