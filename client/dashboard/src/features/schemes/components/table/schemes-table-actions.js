"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useSchemesTableFilters } from "./use-schemes-table-filters";

export default function SchemesTableActions() {
  const { resetFilters, searchQuery, setPage, setSearchQuery, isAnyFilterActive } = useSchemesTableFilters();
  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch searchKey="title" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  );
}
