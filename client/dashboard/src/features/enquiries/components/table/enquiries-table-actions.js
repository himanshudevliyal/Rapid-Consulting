"use client";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { ENQUIRY_STATUSES } from "@/schemas/enquiry";
import { ENQUIRY_KINDS } from "../enquiry-kinds";
import { useEnquiriesTableFilters } from "./use-enquiries-table-filters";

export default function EnquiriesTableActions({ kind = "enquiry" }) {
  const {
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    isAnyFilterActive,
  } = useEnquiriesTableFilters();
  const config = ENQUIRY_KINDS[kind];

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <div className="min-w-[220px] flex-1">
        <DataTableSearch
          searchKey={config.searchKey}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
      </div>
      <DataTableFilterBox
        filterKey="status"
        title="Status"
        options={ENQUIRY_STATUSES}
        filterValue={statusFilter}
        setFilterValue={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
      />
      {config.sources.length > 1 && (
        <DataTableFilterBox
          filterKey="source"
          title="Form"
          options={config.sources}
          filterValue={sourceFilter}
          setFilterValue={(value) => {
            setSourceFilter(value);
            setPage(1);
          }}
        />
      )}
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  );
}
