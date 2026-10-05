"use client";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useServiceTableFilters } from "./use-service-table-filters";

export default function ServicesTableActions() {
  const { searchQuery, setSearchQuery, setPage } = useServiceTableFilters();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="title"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
    </div>
  );
}
