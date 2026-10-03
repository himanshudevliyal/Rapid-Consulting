"use client";

import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useProductInquiryTableFilters } from "./use-product-inquiry-table-filters";

export default function ProductInquiryTableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    isAnyFilterActive,
  } = useProductInquiryTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-2">
      <DataTableSearch
        searchKey=""
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />

      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
