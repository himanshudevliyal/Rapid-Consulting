"use client";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useArticlesTableFilters } from "./use-articles-table-filters";

const STATUS_OPTIONS = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export default function ArticlesTableActions() {
  const { resetFilters, searchQuery, setPage, setSearchQuery, statusFilter, setStatusFilter, isAnyFilterActive } =
    useArticlesTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <div className="min-w-[220px] flex-1">
        <DataTableSearch searchKey="title, excerpt or slug" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
      </div>
      <DataTableFilterBox
        filterKey="is_published"
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
