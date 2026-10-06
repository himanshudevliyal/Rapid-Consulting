import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAllArticles, fetchArticleBySlug, fetchArticles } from "@/services/article-service";
import { LIST_STALE_MS, withListState } from "./list-state";

export const articleKeys = {
  all: ["articles"],
  list: (params) => ["articles", "list", params],
  everything: (params) => ["articles", "all", params],
  detail: (slug) => ["articles", "detail", slug],
};

// One page of published articles. params: { q, tag, category_id, page, limit }.
// Pass `initialData` (a server-fetched list) to render without a loading state.
export const useArticles = (params = {}, { initialData, enabled = true } = {}) =>
  withListState(
    useQuery({
      queryKey: articleKeys.list(params),
      queryFn: () => fetchArticles(params),
      initialData,
      staleTime: LIST_STALE_MS,
      placeholderData: keepPreviousData,
      enabled,
    }),
  );

// Every published article (for the searchable directory).
export const useAllArticles = (params = {}, { initialData, enabled = true } = {}) =>
  withListState(
    useQuery({
      queryKey: articleKeys.everything(params),
      queryFn: () => fetchAllArticles(params),
      initialData,
      staleTime: LIST_STALE_MS,
      enabled,
    }),
  );

// One article by slug; `data` is null when it does not exist / is unpublished.
export const useArticle = (slug, { initialData } = {}) =>
  useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: () => fetchArticleBySlug(slug),
    initialData,
    staleTime: LIST_STALE_MS,
    enabled: !!slug,
  });
