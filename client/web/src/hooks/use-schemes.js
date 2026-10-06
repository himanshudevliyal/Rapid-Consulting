import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAllSchemes, fetchSchemeBySlug, fetchSchemes } from "@/services/scheme-service";
import { LIST_STALE_MS, withListState } from "./list-state";

export const schemeKeys = {
  all: ["schemes"],
  list: (params) => ["schemes", "list", params],
  everything: (params) => ["schemes", "all", params],
  detail: (slug) => ["schemes", "detail", slug],
};

// One page of published schemes. params: { q, tag, category_id, page, limit }.
// Pass `initialData` (a server-fetched list) to render without a loading state.
export const useSchemes = (params = {}, { initialData, enabled = true } = {}) =>
  withListState(
    useQuery({
      queryKey: schemeKeys.list(params),
      queryFn: () => fetchSchemes(params),
      initialData,
      staleTime: LIST_STALE_MS,
      placeholderData: keepPreviousData,
      enabled,
    }),
  );

// Every published scheme (for the searchable directory).
export const useAllSchemes = (params = {}, { initialData, enabled = true } = {}) =>
  withListState(
    useQuery({
      queryKey: schemeKeys.everything(params),
      queryFn: () => fetchAllSchemes(params),
      initialData,
      staleTime: LIST_STALE_MS,
      enabled,
    }),
  );

// One scheme by slug; `data` is null when it does not exist / is unpublished.
export const useScheme = (slug, { initialData } = {}) =>
  useQuery({
    queryKey: schemeKeys.detail(slug),
    queryFn: () => fetchSchemeBySlug(slug),
    initialData,
    staleTime: LIST_STALE_MS,
    enabled: !!slug,
  });
