"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useCaseStudiesTableFilters } from "./use-case-studies-table-filters";

export default function CaseStudiesTableActions() {
  const { resetFilters, searchQuery, setPage, setSearchQuery, isAnyFilterActive } = useCaseStudiesTableFilters();
  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch searchKey="title" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  );
}
