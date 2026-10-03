"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, PackageSearch, RotateCcw, Search, X } from "lucide-react";

import { useLocale, useTranslations } from "next-intl";
import { matchesSearch } from "@/lib/search";
import { serviceHref } from "@/lib/site";
import { ContentCard } from "@/components/common/content-card";
import { industryCatalogue, industryOptions, normalizeIndustry } from "@/lib/pages/industry-catalogue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Section from "@/components/layout/section";

const PAGE_SIZE = 12;

/* "!" = important, taaki purani global input/select CSS override na kare */
const LABEL = "!mb-2 !block !text-[11px] !font-semibold !uppercase !tracking-[0.14em] !text-slate-500";
const SELECT =
  "!block !h-12 !w-full cursor-pointer appearance-none !rounded-xl !border !border-solid !border-slate-200 !bg-white !pl-4 !pr-10 !text-sm !font-medium !text-[#09263e] !shadow-none " +
  "transition-colors hover:!border-slate-300 focus-visible:!border-[#1f5d57] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/20";

function SelectField({ id, label, value, onChange, children }) {
  return (
    <div>
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      <div className="relative">
        <select id={id} value={value} onChange={onChange} className={SELECT}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      </div>
    </div>
  );
}

// Searchable, filterable list of every published service. `industry`
// (?industry=I01, from an industry page) narrows it to that industry's services.
export function ServicesDirectory({ items, industry = "" }) {
  const locale = useLocale();
  const t = useTranslations();
  const id = useId();
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("");
  const [family, setFamily] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectedIndustry, setIndustry] = useState(normalizeIndustry(industry));
  const input = useRef(null);
  const section = useRef(null);
  const focusIndex = useRef(null);

  useEffect(() => {
    if (focusIndex.current !== null) {
      section.current
        ?.querySelectorAll("[data-directory-item]")
        [focusIndex.current]?.querySelector("a")
        ?.focus();
      focusIndex.current = null;
    }
  }, [limit]);

  // A family page belongs to its own group; services to their family.
  const groupOf = (item) => item.family_code || (item.type === "service-family" ? item.code : "");

  const industryCodes = useMemo(() => {
    const record = industryCatalogue.find((entry) => entry.id === selectedIndustry);
    return record ? new Set(record.services) : null;
  }, [selectedIndustry]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (!industryCodes || industryCodes.has(item.code)) &&
          matchesSearch(item, query) &&
          (!format || item.type === format) &&
          (!family || groupOf(item) === family),
      ),
    [items, query, format, family, industryCodes],
  );

  const changeIndustry = (next) => {
    setIndustry(next);
    setLimit(PAGE_SIZE);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("industry", next);
    else url.searchParams.delete("industry");
    window.history.replaceState(null, "", url);
  };

  const formats = [...new Set(items.map((item) => item.type))];
  const groups = [...new Set(items.map(groupOf).filter(Boolean))].sort();
  const industries = industryOptions(locale);

  const reset = () => {
    setQuery("");
    setFormat("");
    setFamily("");
    setLimit(PAGE_SIZE);
    if (selectedIndustry) changeIndustry("");
    input.current?.focus();
  };
  const filtering = Boolean(query || format || family || selectedIndustry);

  // active filter chips
  const chips = [
    query && { key: "q", label: `“${query}”`, clear: () => setQuery("") },
    selectedIndustry && {
      key: "i",
      label: industries.find((o) => o.id === selectedIndustry)?.label || selectedIndustry,
      clear: () => changeIndustry(""),
    },
    format && { key: "f", label: t(`card.types.${format}`), clear: () => setFormat("") },
    family && { key: "g", label: t(`families.${family}`), clear: () => setFamily("") },
  ].filter(Boolean);

  return (
    <Section ref={section} aria-label={t("directory.aria")} className="py-8 lg:py-12">
      {/* ───── Controls card ───── */}
      <div className="rounded-3xl mb-10 border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_-24px_rgba(9,38,62,0.35)] sm:p-6">
        {/* big search */}
        <div className="relative">
          <Label htmlFor={`${id}-query`} className="sr-only">
            {t("directory.search")}
          </Label>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#1f5d57]" aria-hidden="true" />
          <Input
            id={`${id}-query`}
            ref={input}
            type="search"
            placeholder={t("directory.placeholder")}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(PAGE_SIZE);
            }}
            className="!block !h-14 !w-full !rounded-2xl !border !border-solid !border-slate-200 !bg-[#f8f9fa] !pl-13 !pr-5 !text-base !text-[#09263e] !shadow-none placeholder:!text-slate-400 focus-visible:!border-[#1f5d57] focus-visible:!bg-white focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/20"
            style={{ paddingLeft: "3.25rem" }}
          />
        </div>

        {/* filters */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
          <SelectField
            id={`${id}-industry`}
            label={t("site.directory.industry")}
            value={selectedIndustry}
            onChange={(event) => changeIndustry(event.target.value)}
          >
            <option value="">{t("site.directory.allIndustries")}</option>
            {industries.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </SelectField>

          {formats.length > 1 && (
            <SelectField
              id={`${id}-format`}
              label={t("directory.format")}
              value={format}
              onChange={(event) => {
                setFormat(event.target.value);
                setLimit(PAGE_SIZE);
              }}
            >
              <option value="">{t("directory.allFormats")}</option>
              {formats.map((type) => (
                <option key={type} value={type}>
                  {t(`card.types.${type}`)}
                </option>
              ))}
            </SelectField>
          )}

          {groups.length > 1 && (
            <SelectField
              id={`${id}-family`}
              label={t("directory.family")}
              value={family}
              onChange={(event) => {
                setFamily(event.target.value);
                setLimit(PAGE_SIZE);
              }}
            >
              <option value="">{t("directory.allGroups")}</option>
              {groups.map((code) => (
                <option key={code} value={code}>
                  {t(`families.${code}`)}
                </option>
              ))}
            </SelectField>
          )}

          <button
            type="button"
            onClick={reset}
            disabled={!filtering}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#09263e] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#09263e]"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t("directory.reset")}
          </button>
        </div>

        {/* active chips */}
        {chips.length > 0 && (
          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={chip.clear}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-[#eaff6b] py-1.5 pl-3.5 pr-2.5 text-xs font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f]"
                >
                  {chip.label}
                  <X className="size-3.5 opacity-60 group-hover:opacity-100" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ───── Count ───── */}
      <p className="mb-5 mt-8 flex flex-wrap items-center gap-x-3 text-sm font-semibold text-[#09263e]" role="status">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#1f5d57]" aria-hidden="true" />
          {t("directory.showing", { shown: Math.min(limit, filtered.length), total: filtered.length })}
        </span>
        {filtering && <span className="text-xs font-normal text-slate-500">{t("directory.total", { count: items.length })}</span>}
      </p>

      {/* ───── Grid ───── */}
      {filtered.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, limit).map((item) => (
            <div key={item.code} data-directory-item className="h-full">
              <ContentCard
                item={item}
                href={serviceHref(item, locale)}
                typeLabel={t(`card.types.${item.type}`)}
                englishTag={item.has_locale ? "" : t("common.englishTag")}
                actionLabel={t("card.explore")}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e]">
            <PackageSearch className="size-7" aria-hidden="true" />
          </span>
          <h3 className="!mb-0 !mt-5 !text-xl !font-semibold !text-[#09263e]">{t("directory.emptyTitle")}</h3>
          <p className="!mb-0 !mt-2 max-w-md text-[15px] leading-7 text-slate-500">{t("directory.emptyText")}</p>
          <Button
            type="button"
            onClick={reset}
            className="mt-6 h-12 rounded-full bg-[#09263e] px-7 text-sm font-semibold text-white shadow-none hover:bg-[#1f5d57]"
          >
            {t("directory.showAll")}
          </Button>
        </div>
      )}

      {/* ───── Load more ───── */}
      {filtered.length > limit && (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            onClick={() => {
              focusIndex.current = limit;
              setLimit(limit + PAGE_SIZE);
            }}
            className="h-13 gap-3 rounded-full bg-[#09263e] px-8 text-sm font-semibold text-white shadow-none hover:bg-[#1f5d57]"
          >
            {t("directory.loadMore")}
            <span className="rounded-full bg-[#eaff6b] px-2.5 py-0.5 text-xs font-bold text-[#09263e]">
              {t("directory.remaining", { count: filtered.length - limit })}
            </span>
          </Button>
        </div>
      )}
    </Section>
  );
}