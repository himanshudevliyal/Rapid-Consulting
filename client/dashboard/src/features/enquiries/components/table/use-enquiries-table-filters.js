"use client";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

export function useEnquiriesTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  // status=new | in-progress | resolved | spam
  const [statusFilter, setStatusFilter] = useQueryState("status", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });

  // source=<where on the website the form was>
  const [sourceFilter, setSourceFilter] = useQueryState("source", {
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
    setSourceFilter(null);
    setPage(1);
  }, [setSearchQuery, setStatusFilter, setSourceFilter, setPage]);

  const isAnyFilterActive = !!(searchQuery || statusFilter || sourceFilter);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
  };
}
