"use client";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useQueryState } from "nuqs";

export default function OptionsTableActions() {
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
  });
  const [, setPage] = useQueryState("page", {
    defaultValue: 1,
    parse: Number,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DataTableSearch searchKey="name" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
    </div>
  );
}
