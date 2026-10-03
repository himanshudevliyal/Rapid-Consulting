"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useIndustriesTableFilters } from "./use-industries-table-filters";

export default function IndustriesTableActions() {
  const { resetFilters, searchQuery, setPage, setSearchQuery, isAnyFilterActive } = useIndustriesTableFilters();
  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch searchKey="name" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  );
}
