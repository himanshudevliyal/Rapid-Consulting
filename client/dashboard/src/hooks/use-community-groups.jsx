import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCommunityGroup,
  deleteCommunityGroup,
  fetchCommunityGroups,
  fetchCommunityGroup,
  updateCommunityGroup,
} from "@/services/community-group-service";

export const useCommunityGroups = (searchParams = "") => {
  return useQuery({
    queryKey: ["community-groups", searchParams],
    queryFn: () => fetchCommunityGroups(searchParams),
  });
};

export const useCommunityGroup = (id) => {
  return useQuery({
    queryKey: ["community-groups", id],
    queryFn: () => fetchCommunityGroup(id),
    enabled: !!id,
  });
};

export const useCreateCommunityGroup = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommunityGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-groups"] });
      callback?.();
    },
  });
};

export const useUpdateCommunityGroup = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["community-groups", id],
    mutationFn: (data) => updateCommunityGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-groups"] });
      callback?.();
    },
  });
};

export const useDeleteCommunityGroup = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["community-groups", id],
    mutationFn: () => deleteCommunityGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-groups"] });
      callback?.();
    },
  });
};
