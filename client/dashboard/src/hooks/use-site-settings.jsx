import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteSetting, updateSiteSetting } from "@/services/site-setting-service";

// The stored value of a setting. The API may answer with the value itself or
// wrapped as { key, value }; {} when nothing is stored yet.
const valueOf = (response) =>
  response && typeof response === "object" && "value" in response && !Array.isArray(response.value)
    ? (response.value ?? {})
    : (response ?? {});

export const useSiteSetting = (key) => {
  return useQuery({
    queryKey: ["site-settings", key],
    queryFn: () => fetchSiteSetting(key),
    select: valueOf,
  });
};

export const useUpdateSiteSetting = (key, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["site-settings", key],
    mutationFn: (value) => updateSiteSetting(key, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["site-settings", key] });
      callback?.(data);
    },
  });
};
