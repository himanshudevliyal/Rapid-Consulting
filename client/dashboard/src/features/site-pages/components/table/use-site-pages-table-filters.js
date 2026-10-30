"use client";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

const options = { defaultValue: "", shallow: false, clearOnDefault: true };

export function useSitePagesTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState("q", options);
  const [templateFilter, setTemplateFilter] = useQueryState("template", options);
  const [localeFilter, setLocaleFilter] = useQueryState("locale", options);
  const [statusFilter, setStatusFilter] = useQueryState("status", options);

  const [page, setPage] = useQueryState("page", {
    defaultValue: 1,
    parse: Number,
    shallow: false,
    clearOnDefault: true,
  });

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setTemplateFilter(null);
    setLocaleFilter(null);
    setStatusFilter(null);
    setPage(1);
  }, [setSearchQuery, setTemplateFilter, setLocaleFilter, setStatusFilter, setPage]);

  const isAnyFilterActive = !!(searchQuery || templateFilter || localeFilter || statusFilter);

  return {
    searchQuery,
    setSearchQuery,
    templateFilter,
    setTemplateFilter,
    localeFilter,
    setLocaleFilter,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
  };
}
