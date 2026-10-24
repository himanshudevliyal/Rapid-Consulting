import { useQuery } from "@tanstack/react-query";
import { fetchAllIndustries } from "@/services/industry-service";
import { LIST_STALE_MS, withListState } from "./list-state";

export const industryKeys = {
  all: ["industries"],
  everything: ["industries", "all"],
};

// Every active industry. Pass `initialData` (the server-fetched list) to
// render without a loading state; the hook keeps it fresh afterwards.
export const useAllIndustries = ({ initialData, enabled = true } = {}) =>
  withListState(
    useQuery({
      queryKey: industryKeys.everything,
      queryFn: () => fetchAllIndustries(),
      initialData,
      staleTime: LIST_STALE_MS,
      enabled,
    }),
  );
