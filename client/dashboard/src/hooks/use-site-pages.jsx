import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSitePage,
  createSitePagePreviewToken,
  createSitePageTranslation,
  deleteSitePage,
  fetchSitePage,
  fetchSitePageRegistry,
  fetchSitePageRevisions,
  fetchSitePages,
  publishSitePage,
  restoreSitePageRevision,
  submitSitePageForReview,
  unpublishSitePage,
  updateSitePage,
} from "@/services/site-page-service";

export const useSitePageRegistry = () => {
  return useQuery({
    queryKey: ["site-page-registry"],
    queryFn: fetchSitePageRegistry,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSitePages = (searchParams = "") => {
  return useQuery({
    queryKey: ["site-pages", "list", searchParams],
    queryFn: () => fetchSitePages(searchParams),
  });
};

export const useSitePage = (id) => {
  return useQuery({
    queryKey: ["site-pages", "one", id],
    queryFn: () => fetchSitePage(id),
    enabled: !!id,
  });
};

export const useSitePageRevisions = (id, enabled = true) => {
  return useQuery({
    queryKey: ["site-pages", "revisions", id],
    queryFn: () => fetchSitePageRevisions(id),
    enabled: !!id && enabled,
  });
};

// The callback gets the API answer (the created page for a create).
export const useCreateSitePage = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSitePage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["site-pages"] });
      callback?.(data);
    },
  });
};

// Every action on one page refreshes the page, the list and the revisions.
const usePageAction = (id, mutationFn, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["site-pages", id],
    mutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["site-pages"] });
      callback?.(data);
    },
  });
};

export const useUpdateSitePage = (id, callback) =>
  usePageAction(id, (data) => updateSitePage(id, data), callback);

export const useSubmitSitePageForReview = (id, callback) =>
  usePageAction(id, () => submitSitePageForReview(id), callback);

export const usePublishSitePage = (id, callback) =>
  usePageAction(id, () => publishSitePage(id), callback);

export const useUnpublishSitePage = (id, callback) =>
  usePageAction(id, () => unpublishSitePage(id), callback);

export const useRestoreSitePageRevision = (id, callback) =>
  usePageAction(id, (revisionId) => restoreSitePageRevision(id, revisionId), callback);

export const useCreateSitePageTranslation = (id, callback) =>
  usePageAction(id, (locale) => createSitePageTranslation(id, locale), callback);

export const useDeleteSitePage = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["site-pages", id],
    mutationFn: () => deleteSitePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-pages"] });
      callback?.();
    },
  });
};

export const usePreviewToken = (id) =>
  useMutation({
    mutationKey: ["site-pages", id, "preview-token"],
    mutationFn: () => createSitePagePreviewToken(id),
  });
