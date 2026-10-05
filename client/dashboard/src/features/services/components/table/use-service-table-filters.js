"use client";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

export function useServiceTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState("q", {
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
    setPage(1);
  }, [setSearchQuery, setPage]);

  const isAnyFilterActive = searchQuery;

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
  };
}
