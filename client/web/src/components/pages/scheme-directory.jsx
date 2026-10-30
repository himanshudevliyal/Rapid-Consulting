"use client";

import { useEffect, useMemo, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { UrlWatch } from "@/components/common/url-watch";
import { hasTranslation } from "@/i18n/has-translation";
import { useNoindex, usePages, useQueryText, useUrlFilters } from "@/hooks/use-url-filters";
import { resolveIndustryId } from "@/lib/industry-filter";
import {
  FALLBACK_TOPIC,
  matchesSchemeSearch,
  otherMatchSlugs,
  schemeSearchDoc,
  schemeTopics,
} from "@/lib/pages/scheme-groups";
import { filterKey, resolveOption } from "@/lib/url-filters";
import { b2dText } from "@/lib/pages/b2d-text";
import { fillTokens } from "@/lib/pages/managed-view";
import { BandHeading } from "./b2d-parts";
import { StatusPill, knownStatus, statusLabel } from "./scheme-status";
import { ActiveFilters, FilterPanel, FilterRow, FilterSearch, NoMatches, ResultCount, ShowMore } from "./filter-controls";

const KEYS = ["q", "industry", "topic"];
const PAGE_SIZE = 12;

// R02 - the scheme directory.
//
// - Search and the filter rows (industry, topic) combine; each row holds one
//   choice. A scheme can sit in several industries and topics.
// - Any change starts again at 12 matches; "Show more" adds 12.
// - The count says how many are shown, how many match and how many exist.
// - Incoming links preselect rows (?industry=, ?topic=, ?q=); the selection is
//   shown as removable chips, written back to the address, and Back/Forward
//   restore it. Filtered views are noindex.
// - D028 / D049 only appear under "Other matches", outside the main count.
// - Figma R02: a list of rows (title, meta line, status pill, arrow). The pill
//   always comes from the scheme's recorded status (never assumed "Open").
//
// `copy` (optional, from the page's managed text): { eyebrow, title with {total},
// topicRow, industryRow, allLabel, clearLabel, moreLabel, countTemplate with
// {shown} and {total} }. An empty field keeps the built-in wording.
export function SchemeDirectory({ items, industries = [], initial = {}, copy = {} }) {
  const locale = useLocale();
  const t = useTranslations();
  const w = useTranslations("wc.schemes");
  const f = useTranslations("wc.filters");
  const has = hasTranslation(t);
  const tx = b2dText(t);

  const { values, update, clear, sync } = useUrlFilters(KEYS, initial);
  const [text, setText] = useQueryText(values.q, (q) => update({ q }, { replace: true }));
  const searchBox = useRef(null);
  const region = useRef(null);
  const focusIndex = useRef(null);

  // ── the collection, grouped once ──────────────────────────────────────────
  const entries = useMemo(() => {
    const other = otherMatchSlugs();
    return items.map((item) => ({
      item,
      doc: schemeSearchDoc(item),
      topics: schemeTopics(item),
      other: other.has(item.slug),
    }));
  }, [items]);
  const main = useMemo(() => entries.filter((entry) => !entry.other), [entries]);
  const others = useMemo(() => entries.filter((entry) => entry.other), [entries]);

  // Industry names per scheme (from the industries chosen for each one in the admin panel).
  const industryNames = useMemo(() => {
    const map = new Map();
    industries.forEach((entry) =>
      entry.schemeSlugs.forEach((slug) => map.set(slug, [...(map.get(slug) ?? []), entry.title])),
    );
    return map;
  }, [industries]);

  const topicLabel = (topic) => (has(`site.topics.${topic}`) ? t(`site.topics.${topic}`) : topic);

  const industryOptions = useMemo(
    () =>
      industries
        .map((entry) => ({
          value: entry.id,
          label: entry.title,
          count: main.filter((candidate) => entry.schemeSlugs.includes(candidate.item.slug)).length,
        }))
        .filter((option) => option.count > 0),
    [industries, main],
  );

  const topicOptions = useMemo(() => {
    const counts = new Map();
    main.forEach((entry) => entry.topics.forEach((topic) => counts.set(topic, (counts.get(topic) ?? 0) + 1)));
    return [...counts.entries()]
      .sort(([a], [b]) => (a === FALLBACK_TOPIC) - (b === FALLBACK_TOPIC) || a.localeCompare(b))
      .map(([topic, count]) => ({ value: filterKey(topic), label: topicLabel(topic), count }));
  }, [main]);

  // What the address asks for, as values the controls can show.
  const industryValue = resolveIndustryId(values.industry, industries);
  const topicValue = resolveOption(values.topic, topicOptions);

  // Legacy identities (industry=I01) and labels in an incoming link become the
  // canonical keys in the address; values that do not exist are dropped.
  useEffect(() => {
    if (values.industry && industries.length && industryValue !== values.industry) {
      update({ industry: industryValue }, { replace: true });
    }
    if (values.topic && main.length && topicValue !== values.topic) {
      update({ topic: topicValue }, { replace: true });
    }
  }, [values.industry, values.topic, industryValue, topicValue, industries.length, main.length]);

  // ── matching ──────────────────────────────────────────────────────────────
  const industryRecord = industries.find((entry) => entry.id === industryValue);
  const query = text.trim();
  const filtering = Boolean(query || industryValue || topicValue);

  const matches = (entry) =>
    (!industryRecord || industryRecord.schemeSlugs.includes(entry.item.slug)) &&
    (!topicValue || entry.topics.some((topic) => filterKey(topic) === topicValue)) &&
    matchesSchemeSearch(entry.doc, query);

  const results = useMemo(() => {
    const found = main.filter(matches);
    if (!industryRecord) return found;
    // Inside an industry the order is the industry's own (set in the admin panel).
    const rank = (entry) => industryRecord.schemeSlugs.indexOf(entry.item.slug);
    return [...found].sort((a, b) => rank(a) - rank(b));
  }, [main, query, industryValue, topicValue, industryRecord]);

  const otherMatches = useMemo(
    () => (filtering ? others.filter(matches) : []),
    [others, filtering, query, industryValue, topicValue],
  );

  const signature = `${query}|${industryValue}|${topicValue}`;
  const [pages, showMore] = usePages(signature);
  const limit = pages * PAGE_SIZE;
  const visible = results.slice(0, limit);
  const remaining = Math.max(0, results.length - limit);

  useNoindex(filtering || Boolean(values.q || values.industry || values.topic));

  // After "Show more" the first new card takes focus (the page does not jump).
  useEffect(() => {
    if (focusIndex.current === null) return;
    region.current?.querySelectorAll("[data-directory-item]")[focusIndex.current]?.querySelector("a")?.focus({ preventScroll: false });
    focusIndex.current = null;
  }, [pages]);

  // ── actions ───────────────────────────────────────────────────────────────
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
      kind: w("industryRow"),
      label: industryOptions.find((o) => o.value === industryValue)?.label ?? industryRecord?.title ?? industryValue,
      onRemove: () => update({ industry: "" }),
    },
    topicValue && {
      key: "topic",
      kind: w("topicRow"),
      label: topicOptions.find((o) => o.value === topicValue)?.label ?? topicValue,
      onRemove: () => update({ topic: "" }),
    },
  ].filter(Boolean);

  const row = (entry) => {
    const { item } = entry;
    const status = knownStatus(item.facts?.status);
    const names = industryNames.get(item.slug) ?? [];
    const meta = [
      item.facts?.authority || item.ministry,
      entry.topics.map(topicLabel).join(", "),
      names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", "),
      locale === "hi" && item.locale === "en" ? t("common.englishTag").trim() : "",
    ].filter(Boolean);
    return (
      <li key={item.id} data-directory-item className="m-0">
        <a
          href={item.href}
          className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[#09263e]! no-underline transition-colors hover:border-[#09263e]/50 hover:bg-[#f8faf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-5"
        >
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-snug [overflow-wrap:anywhere]">{item.title}</span>
            {meta.length > 0 && (
              <span className="mt-1 block text-sm leading-5 text-slate-600 [overflow-wrap:anywhere]">{meta.join(" · ")}</span>
            )}
          </span>
          <ArrowUpRight
            className="order-2 size-5 shrink-0 text-[#09263e] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:order-3"
            aria-hidden="true"
          />
          <StatusPill status={status} label={statusLabel(status, t, tx)} className="order-3 col-span-2 sm:order-2 sm:col-span-1" />
        </a>
      </li>
    );
  };

  const noun = t("site.directory.schemes");

  return (
    <section id="scheme-directory" aria-labelledby="scheme-directory-title" className="scroll-mt-24 bg-[#f4f7f5] py-12 sm:py-16">
      <UrlWatch onChange={sync} />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <BandHeading
          id="scheme-directory-title"
          eyebrow={copy.eyebrow || tx("schemes.list.eyebrow", "All schemes")}
          title={
            copy.title
              ? fillTokens(copy.title, { total: main.length, count: main.length })
              : tx("schemes.list.title", "{count} schemes, each with its status.", { count: main.length })
          }
          className="mb-8"
        />
        <div ref={region} role="region" aria-label={t("site.directory.browse", { noun })}>
          <FilterPanel>
            <FilterSearch
              label={t("site.directory.searchIn", { noun })}
              placeholder={w("placeholder")}
              value={text}
              onChange={setText}
              inputRef={searchBox}
            />
            <div className="mt-5 space-y-5">
              {industryOptions.length > 0 && (
                <FilterRow
                  label={copy.industryRow || w("industryRow")}
                  allLabel={copy.allLabel || t("site.directory.allIndustries")}
                  options={industryOptions}
                  value={industryValue}
                  onChange={(industry) => update({ industry })}
                />
              )}
              {topicOptions.length > 1 && (
                <FilterRow
                  label={copy.topicRow || w("topicRow")}
                  allLabel={copy.allLabel || w("allTopics")}
                  options={topicOptions}
                  value={topicValue}
                  onChange={(topic) => update({ topic })}
                />
              )}
            </div>
            <ActiveFilters items={chips} onClear={clearAll} clearLabel={copy.clearLabel} />
          </FilterPanel>

          <p className="!mb-5 !mt-0 max-w-3xl text-xs leading-6 text-slate-600">{t("site.directory.schemeNote")}</p>

          <ResultCount>
            <span>
              {copy.countTemplate
                ? fillTokens(copy.countTemplate, { shown: visible.length, total: results.length })
                : filtering
                  ? w("countMatching", { shown: visible.length, total: results.length })
                  : w("count", { shown: visible.length, total: results.length })}
            </span>
            {filtering && <span className="text-xs font-normal text-slate-600">{w("inDirectory", { count: main.length })}</span>}
            {otherMatches.length > 0 && (
              <span className="text-xs font-normal text-slate-600">{w("otherCount", { count: otherMatches.length })}</span>
            )}
          </ResultCount>

          {results.length > 0 ? (
            <ul className="m-0 grid list-none gap-3 p-0">{visible.map(row)}</ul>
          ) : (
            <NoMatches
              title={w("emptyTitle")}
              text={filtering ? w("emptyFiltered") : w("emptyText")}
              onClear={filtering ? clearAll : undefined}
              clearLabel={copy.clearLabel || f("clear")}
            />
          )}

          {remaining > 0 && (
            <ShowMore
              label={copy.moreLabel || w("showMore", { count: Math.min(PAGE_SIZE, remaining) })}
              remaining={w("remaining", { count: remaining })}
              onClick={() => {
                focusIndex.current = limit;
                showMore();
              }}
            />
          )}

          {otherMatches.length > 0 && (
            <section
              aria-labelledby="scheme-other-matches"
              className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 sm:p-8"
            >
              <h3 id="scheme-other-matches" className="!mb-1 !mt-0 !text-xl !font-semibold !text-[#09263e]">
                {w("otherTitle")}
              </h3>
              <p className="!mb-6 !mt-0 max-w-3xl text-sm leading-6 text-slate-600">{w("otherText")}</p>
              <ul className="m-0 grid list-none gap-3 p-0">{otherMatches.map(row)}</ul>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
