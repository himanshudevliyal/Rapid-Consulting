"use client";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useCommunityGroupsTableFilters } from "./use-community-groups-table-filters";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function CommunityGroupsTableActions() {
  const { resetFilters, searchQuery, setPage, setSearchQuery, statusFilter, setStatusFilter, isAnyFilterActive } =
    useCommunityGroupsTableFilters();
  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <div className="min-w-[220px] flex-1">
        <DataTableSearch searchKey="name or audience" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
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
