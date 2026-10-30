"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useSitePageRegistry } from "@/hooks/use-site-pages";
import { LOCALES, PAGE_STATUS_OPTIONS, TEMPLATE_KEYS } from "@/lib/site-page";
import { useSitePagesTableFilters } from "./use-site-pages-table-filters";

// A single-choice filter (the page API takes one value per filter).
function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      aria-label={label}
      className="h-10 rounded-md border bg-transparent px-3 text-sm"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    >
      <option value="">{label}: all</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function SitePagesTableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    templateFilter,
    setTemplateFilter,
    localeFilter,
    setLocaleFilter,
    statusFilter,
    setStatusFilter,
    isAnyFilterActive,
  } = useSitePagesTableFilters();
  const registry = useSitePageRegistry();

  const templates = registry.data?.templates
    ? Object.entries(registry.data.templates).map(([value, item]) => ({ value, label: item.label ?? value }))
    : TEMPLATE_KEYS.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }));

  const apply = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="my-3 flex flex-wrap items-center gap-3">
      <div className="min-w-[220px] flex-1">
        <DataTableSearch searchKey="title or path" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
      </div>
      <FilterSelect label="Template" value={templateFilter} onChange={apply(setTemplateFilter)} options={templates} />
      <FilterSelect label="Language" value={localeFilter} onChange={apply(setLocaleFilter)} options={LOCALES} />
      <FilterSelect label="Status" value={statusFilter} onChange={apply(setStatusFilter)} options={PAGE_STATUS_OPTIONS} />
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  );
}
