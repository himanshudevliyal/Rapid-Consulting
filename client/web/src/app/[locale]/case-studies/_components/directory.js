"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import { UrlWatch } from "@/components/common/url-watch";
import { ActiveFilters, FilterPanel, FilterRow, FilterSearch, NoMatches, ResultCount, ShowMore } from "@/components/pages/filter-controls";
import { BandHeading } from "@/components/pages/b2d-parts";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { hasTranslation } from "@/i18n/has-translation";
import { useMediaQuery, useNoindex, usePages, useQueryText, useUrlFilters } from "@/hooks/use-url-filters";
import { b2dText } from "@/lib/pages/b2d-text";
import { fillTokens } from "@/lib/pages/managed-view";
import { homeText } from "@/lib/pages/home-copy";
import { matchesSearch } from "@/lib/pages/discovery";
import { filterKey, resolveOption } from "@/lib/url-filters";

const KEYS = ["q", "industry", "service"];
// "Show more" adds 9 cards on desktop and 6 on mobile.
const STEP_DESKTOP = 9;
const STEP_MOBILE = 6;

// Service families a case can be filed under: its S-code tags (S01...).
const SERVICE_CODE = /^S\d{2}$/i;
const serviceCodes = (item) => [...new Set((item.tags ?? []).filter((tag) => SERVICE_CODE.test(String(tag).trim())).map((tag) => String(tag).trim().toUpperCase()))];
const industryOf = (item) => (item.industry || (item.family ? item.group : "") || "").trim();

// W00 - the case archive (Figma 1677-96674: "All cases / Cases like yours.",
// filter chips, a grid of case cards, Show more).
//
// - One choice per row (industry, service), combined across rows with the
//   search; the choices come from the whole collection, so a row never loses
//   options because of what else is chosen.
// - The service row stays hidden until a second service has cases.
// - Clear appears while anything is applied; the count says shown / matching /
//   in the archive; "no match" is a real empty state.
// - "Show more" adds 9 (desktop) or 6 (mobile) and disappears when everything
//   fits. Filters live in the address (Back works); filtered views are noindex.
//
// `copy` (optional, from the page's managed text): { eyebrow, title, industryRow
// (the filter row label), allLabel, countTemplate with {shown} and {total} }. An
// empty field keeps the built-in wording. The chips themselves stay live (the
// industries of the published cases).
export function Directory({ items, kind = "cases", initial = {}, copy = {} }) {
  const t = useTranslations();
  const c = useTranslations("wc.cases");
  const f = useTranslations("wc.filters");
  const has = hasTranslation(t);
  const tx = b2dText(t);
  const locale = useLocale();
  const labels = caseCardLabels(homeText(t, has, locale));

  const { values, update, clear, sync } = useUrlFilters(KEYS, initial);
  const [text, setText] = useQueryText(values.q, (q) => update({ q }, { replace: true }));
  const searchBox = useRef(null);
  const region = useRef(null);
  const focusIndex = useRef(null);
  const mobile = useMediaQuery("(max-width: 767px)");
  const step = mobile ? STEP_MOBILE : STEP_DESKTOP;

  // ── choices, from the full collection ─────────────────────────────────────
  const industryOptions = useMemo(() => {
    const counts = new Map();
    items.forEach((item) => {
      const label = industryOf(item);
      if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, count]) => ({ value: filterKey(label), label, count }));
  }, [items]);

  const serviceOptions = useMemo(() => {
    const counts = new Map();
    items.forEach((item) => serviceCodes(item).forEach((code) => counts.set(code, (counts.get(code) ?? 0) + 1)));
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, count]) => ({
        value: code.toLowerCase(),
        label: has(`wc.cases.services.${code}`) ? t(`wc.cases.services.${code}`) : code,
        count,
      }));
  }, [items]);

  const showIndustry = industryOptions.length > 1;
  const showService = serviceOptions.length > 1;

  const industryValue = showIndustry ? resolveOption(values.industry, industryOptions) : "";
  const serviceValue = showService ? resolveOption(values.service, serviceOptions) : "";
  const query = text.trim();
  const filtering = Boolean(query || industryValue || serviceValue);

  const results = useMemo(
    () =>
      items.filter(
        (item) =>
          (!industryValue || filterKey(industryOf(item)) === industryValue) &&
          (!serviceValue || serviceCodes(item).some((code) => code.toLowerCase() === serviceValue)) &&
          matchesSearch({ ...item, aliases: [item.industry, item.sector, item.location, item.rapidRole, ...(item.tags ?? [])].filter(Boolean) }, query),
      ),
    [items, query, industryValue, serviceValue],
  );

  const [pages, showMore] = usePages(`${query}|${industryValue}|${serviceValue}`);
  const limit = pages * step;
  const visible = results.slice(0, limit);
  const remaining = Math.max(0, results.length - limit);

  useNoindex(filtering || Boolean(values.q || values.industry || values.service));

  useEffect(() => {
    if (focusIndex.current === null) return;
    region.current?.querySelectorAll("[data-case-card]")[focusIndex.current]?.focus();
    focusIndex.current = null;
  }, [pages]);

  const clearAll = () => {
    setText("");
    clear();
    searchBox.current?.focus();
  };

  const chips = [
    query && {
      key: "q",
      kind: f("search"),
      label: `“${query}”`,
      onRemove: () => {
        setText("");
        update({ q: "" });
      },
    },
    industryValue && {
      key: "industry",
      kind: c("industryRow"),
      label: industryOptions.find((o) => o.value === industryValue)?.label ?? industryValue,
      onRemove: () => update({ industry: "" }),
    },
    serviceValue && {
      key: "service",
      kind: c("serviceRow"),
      label: serviceOptions.find((o) => o.value === serviceValue)?.label ?? serviceValue,
      onRemove: () => update({ service: "" }),
    },
  ].filter(Boolean);

  const noun = t(`site.directory.${kind}`);

  return (
    <section id="case-archive" aria-labelledby="case-archive-title" className="scroll-mt-24 bg-[#f4f7f5] py-12 sm:py-16">
      <UrlWatch onChange={sync} />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <BandHeading
          id="case-archive-title"
          eyebrow={copy.eyebrow || tx("cases.list.eyebrow", "All cases")}
          title={copy.title || tx("cases.list.title", "Cases like yours.")}
          className="mb-8"
        />
        <div ref={region} role="region" aria-label={t("site.directory.browse", { noun })}>
          <FilterPanel>
            <FilterSearch
              label={t("site.directory.searchIn", { noun })}
              placeholder={c("placeholder")}
              value={text}
              onChange={setText}
              inputRef={searchBox}
            />
            {(showIndustry || showService) && (
              <div className="mt-5 space-y-5">
                {showIndustry && (
                  <FilterRow
                    label={copy.industryRow || c("industryRow")}
                    allLabel={copy.allLabel || t("site.directory.allIndustries")}
                    options={industryOptions}
                    value={industryValue}
                    onChange={(industry) => update({ industry })}
                  />
                )}
                {showService && (
                  <FilterRow
                    label={c("serviceRow")}
                    allLabel={c("allServices")}
                    options={serviceOptions}
                    value={serviceValue}
                    onChange={(service) => update({ service })}
                  />
                )}
              </div>
            )}
            <ActiveFilters items={chips} onClear={clearAll} clearLabel={copy.clearLabel} />
          </FilterPanel>

          <ResultCount>
            <span>
              {copy.countTemplate
                ? fillTokens(copy.countTemplate, { shown: visible.length, total: results.length })
                : filtering
                  ? c("countMatching", { shown: visible.length, total: results.length })
                  : c("count", { shown: visible.length, total: results.length })}
            </span>
            {filtering && <span className="text-xs font-normal text-slate-600">{c("inArchive", { count: items.length })}</span>}
          </ResultCount>

          {results.length > 0 ? (
            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  labels={labels}
                  label={t("site.card.caseStudy")}
                  cta={t("site.card.readCase")}
                />
              ))}
            </div>
          ) : (
            <NoMatches
              title={c("emptyTitle")}
              text={c("emptyText")}
              onClear={filtering ? clearAll : undefined}
              clearLabel={f("clear")}
            />
          )}

          {remaining > 0 && (
            <ShowMore
              label={c("showMore", { count: Math.min(step, remaining) })}
              remaining={c("remaining", { count: remaining })}
              onClick={() => {
                focusIndex.current = limit;
                showMore();
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
