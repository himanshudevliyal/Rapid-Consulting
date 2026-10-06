"use client";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

export function useServiceTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  // Format (services.type) and Family / topic (services.family_code); several
  // values are joined with "." (e.g. type=service.service-family).
  const [typeFilter, setTypeFilter] = useQueryState("type", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  const [familyFilter, setFamilyFilter] = useQueryState("family", {
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
    setTypeFilter(null);
    setFamilyFilter(null);
    setPage(1);
  }, [setSearchQuery, setTypeFilter, setFamilyFilter, setPage]);

  const isAnyFilterActive = !!(searchQuery || typeFilter || familyFilter);

  return {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    familyFilter,
    setFamilyFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
  };
}
