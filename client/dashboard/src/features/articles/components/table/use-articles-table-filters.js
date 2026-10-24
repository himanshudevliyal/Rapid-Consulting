"use client";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

export function useArticlesTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  // is_published=true | false (both selected = no filter)
  const [statusFilter, setStatusFilter] = useQueryState("is_published", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  // type=article | guide
  const [typeFilter, setTypeFilter] = useQueryState("type", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  const [page, setPage] = useQueryState("page", {
    defaultValue: 1,
    parse: Number,
    shallow: false,
    clearOnDefault: true,
  });

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setStatusFilter(null);
    setTypeFilter(null);
    setPage(1);
  }, [setSearchQuery, setStatusFilter, setTypeFilter, setPage]);

  const isAnyFilterActive = !!(searchQuery || statusFilter || typeFilter);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
  };
}
