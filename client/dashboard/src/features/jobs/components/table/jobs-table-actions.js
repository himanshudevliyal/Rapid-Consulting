"use client";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useJobsTableFilters } from "./use-jobs-table-filters";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Closed" },
];

export default function JobsTableActions() {
  const { resetFilters, searchQuery, setPage, setSearchQuery, statusFilter, setStatusFilter, isAnyFilterActive } =
    useJobsTableFilters();
  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <div className="min-w-[220px] flex-1">
        <DataTableSearch searchKey="title or location" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
      </div>
      <DataTableFilterBox
        filterKey="is_active"
        title="Status"
        options={STATUS_OPTIONS}
        filterValue={statusFilter}
        setFilterValue={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
      />
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  );
}
