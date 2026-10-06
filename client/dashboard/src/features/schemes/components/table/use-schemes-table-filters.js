"use client";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

export function useSchemesTableFilters() {
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

  const [page, setPage] = useQueryState("page", {
    defaultValue: 1,
    parse: Number,
    shallow: false,
    clearOnDefault: true,
  });

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setStatusFilter(null);
    setPage(1);
  }, [setSearchQuery, setStatusFilter, setPage]);

  const isAnyFilterActive = !!(searchQuery || statusFilter);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
  };
}
