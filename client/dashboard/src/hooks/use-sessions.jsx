import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSession,
  deleteSession,
  fetchSessions,
  fetchSession,
  updateSession,
} from "@/services/session-service";

export const useSessions = (searchParams = "") => {
  return useQuery({
    queryKey: ["sessions", searchParams],
    queryFn: () => fetchSessions(searchParams),
  });
};

export const useSession = (id) => {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => fetchSession(id),
    enabled: !!id,
  });
};

export const useCreateSession = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      callback?.();
    },
  });
};

export const useUpdateSession = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["sessions", id],
    mutationFn: (data) => updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      callback?.();
    },
  });
};

export const useDeleteSession = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["sessions", id],
    mutationFn: () => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      callback?.();
    },
  });
};
