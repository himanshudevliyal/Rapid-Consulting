import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAllCaseStudies, fetchCaseStudyBySlug, fetchCaseStudies } from "@/services/case-study-service";
import { LIST_STALE_MS, withListState } from "./list-state";

export const caseStudyKeys = {
  all: ["case-studies"],
  list: (params) => ["case-studies", "list", params],
  everything: (params) => ["case-studies", "all", params],
  detail: (slug) => ["case-studies", "detail", slug],
};

// One page of published case studies. params: { q, tag, category_id, page, limit }.
// Pass `initialData` (a server-fetched list) to render without a loading state.
export const useCaseStudies = (params = {}, { initialData, enabled = true } = {}) =>
  withListState(
    useQuery({
      queryKey: caseStudyKeys.list(params),
      queryFn: () => fetchCaseStudies(params),
      initialData,
      staleTime: LIST_STALE_MS,
      placeholderData: keepPreviousData,
      enabled,
    }),
  );

// Every published case study (for the searchable directory).
export const useAllCaseStudies = (params = {}, { initialData, enabled = true } = {}) =>
  withListState(
    useQuery({
      queryKey: caseStudyKeys.everything(params),
      queryFn: () => fetchAllCaseStudies(params),
      initialData,
      staleTime: LIST_STALE_MS,
      enabled,
    }),
  );

// One case study by slug; `data` is null when it does not exist / is unpublished.
export const useCaseStudy = (slug, { initialData } = {}) =>
  useQuery({
    queryKey: caseStudyKeys.detail(slug),
    queryFn: () => fetchCaseStudyBySlug(slug),
    initialData,
    staleTime: LIST_STALE_MS,
    enabled: !!slug,
  });
