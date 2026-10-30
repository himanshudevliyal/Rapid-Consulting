"use client";

import { useId } from "react";
import { ChevronDown, PackageSearch, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// The one set of filter controls behind the scheme directory, the case
// archive and the Resources explorer. "!" = important, so the older global
// input / button rules do not win.

export function FilterPanel({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_44px_-34px_rgba(9,38,62,0.4)] sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FilterSearch({ label, value, onChange, placeholder, inputRef, hint }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} className="!mb-2 !block !text-[11px] !font-semibold !uppercase !tracking-[0.14em] !text-slate-600">
        {label}
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#1f5d57]" aria-hidden="true" />
        <Input
          id={id}
          ref={inputRef}
          type="search"
          value={value}
          placeholder={placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="!block !h-12 !w-full !rounded-2xl !border !border-solid !border-slate-200 !bg-[#f8f9fa] !pr-4 !text-base !text-[#09263e] !shadow-none placeholder:!text-slate-500 focus-visible:!border-[#1f5d57] focus-visible:!bg-white focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/20"
          style={{ paddingLeft: "2.9rem" }}
        />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="!mb-0 !mt-2 text-xs leading-5 text-slate-600">
          {hint}
        </p>
      )}
    </div>
  );
}

/** A labelled native select (long lists: people). */
export function FilterSelect({ label, value, onChange, children }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="!mb-2 !block !text-[11px] !font-semibold !uppercase !tracking-[0.14em] !text-slate-600">
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="!block !h-12 !w-full cursor-pointer appearance-none !rounded-xl !border !border-solid !border-slate-200 !bg-white !pl-4 !pr-10 !text-sm !font-medium !text-[#09263e] !shadow-none transition-colors hover:!border-slate-300 focus-visible:!border-[#1f5d57] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#1f5d57]/20"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      </div>
    </div>
  );
}

export function Chip({ pressed, onClick, children, className }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2 sm:whitespace-normal",
        pressed
          ? "border-[#09263e] bg-[#09263e] text-white"
          : "border-slate-200 bg-white text-[#09263e] hover:border-[#09263e]/40 hover:bg-[#eef3f1]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * One filter row: "All" plus one chip per choice, one choice at a time.
 * Choosing the chosen chip again returns to "All". On narrow screens the row
 * scrolls sideways inside itself (the page never does).
 *   options: [{ value, label, count? }]
 */
export function FilterRow({ label, options, value, onChange, allLabel }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={`${id}-label`} className="min-w-0">
      <p id={`${id}-label`} className="!mb-2 !mt-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
        <Chip pressed={!value} onClick={() => onChange("")}>
          {allLabel}
        </Chip>
        {options.map((option) => (
          <Chip
            key={option.value}
            pressed={value === option.value}
            onClick={() => onChange(value === option.value ? "" : option.value)}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  value === option.value ? "bg-white/20 text-white" : "bg-[#e8efec] text-[#1f5d57]",
                )}
              >
                {option.count}
              </span>
            )}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/**
 * What is applied right now (search words, rows, incoming presets), each one
 * removable on its own, plus a single Clear that resets all of it. Nothing is
 * rendered while nothing is applied.
 *   items: [{ key, kind, label, onRemove }]
 */
export function ActiveFilters({ items, onClear, className, clearLabel }) {
  const t = useTranslations("wc.filters");
  if (!items.length) return null;
  return (
    <div className={cn("mt-5 flex flex-wrap items-center gap-2", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">{t("applied")}</span>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={item.onRemove}
              aria-label={t("remove", { filter: `${item.kind}: ${item.label}` })}
              className="group inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#eaff6b] py-1 pl-3.5 pr-2.5 text-xs font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2"
            >
              <span className="font-normal opacity-70">{item.kind}:</span>
              <span className="text-left">{item.label}</span>
              <X className="size-3.5 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClear}
        className="min-h-9 rounded-full px-3 text-sm font-semibold text-[#09263e] underline underline-offset-4 hover:text-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]"
      >
        {clearLabel || t("clear")}
      </button>
    </div>
  );
}

/** Live count line. Children are the sentences (shown of matching, in total). */
export function ResultCount({ children, className }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn("!mb-5 !mt-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-[#09263e]", className)}
    >
      {children}
    </p>
  );
}

/** "Show more" with the number still hidden. Hidden by the caller when nothing is left. */
export function ShowMore({ onClick, label, remaining }) {
  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#09263e] bg-white px-8 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#eaff6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
      >
        {label}
        <span className="rounded-full bg-[#e8efec] px-2.5 py-0.5 text-xs font-bold text-[#1f5d57]">{remaining}</span>
      </button>
    </div>
  );
}

/** The genuine "nothing matches" state, with the way back. */
export function NoMatches({ title, text, onClear, clearLabel }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#e8efec] text-[#1f5d57]">
        <PackageSearch className="size-7" aria-hidden="true" />
      </span>
      <h3 className="!mb-0 !mt-5 !text-xl !font-semibold !text-[#09263e]">{title}</h3>
      <p className="!mb-0 !mt-2 max-w-md text-[15px] leading-7 text-slate-600">{text}</p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#09263e] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
