"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useProductVariantsTableFilters } from "./use-product-variants-table-filters";

export default function ProductVariantsTableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    isAnyFilterActive,
  } = useProductVariantsTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="name"
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
