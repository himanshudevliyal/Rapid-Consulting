"use client";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useAllServiceFamilyTopics, useAllServiceFormats } from "@/hooks/use-service-options";
import { useServiceTableFilters } from "./use-service-table-filters";

export default function ServicesTableActions() {
  const {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    familyFilter,
    setFamilyFilter,
    setPage,
    resetFilters,
    isAnyFilterActive,
  } = useServiceTableFilters();
  const formats = useAllServiceFormats();
  const topics = useAllServiceFamilyTopics();

  const toOptions = (rows = []) => rows.map((row) => ({ value: row.code, label: row.name }));
  const change = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <div className="min-w-[220px] flex-1">
        <DataTableSearch searchKey="title or code" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
      </div>
      <DataTableFilterBox
        filterKey="type"
        title="Format"
        options={toOptions(formats.data?.data)}
        filterValue={typeFilter}
        setFilterValue={change(setTypeFilter)}
      />
      <DataTableFilterBox
        filterKey="family"
        title="Family / topic"
        options={toOptions(topics.data?.data)}
        filterValue={familyFilter}
        setFilterValue={change(setFamilyFilter)}
      />
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  );
}
