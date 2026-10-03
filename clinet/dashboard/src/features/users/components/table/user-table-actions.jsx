"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useUserTableFilters } from "./use-user-table-filters";
import { userRoles } from "@/data";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";

export default function UserTableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    roleFilter,
    setRoleFilter,
    setSearchQuery,
    isAnyFilterActive,
  } = useUserTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-2">
      <DataTableSearch
        searchKey=""
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableFilterBox
        filterKey="role"
        title="Role"
        options={userRoles}
        setFilterValue={setRoleFilter}
        filterValue={roleFilter}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
