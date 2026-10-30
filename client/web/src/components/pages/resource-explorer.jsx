"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import { PersonCard } from "@/components/common/person-card";
import { TabList, panelId, tabId } from "@/components/common/tab-list";
import { UrlWatch } from "@/components/common/url-watch";
import Section from "@/components/layout/section";
import { hasTranslation } from "@/i18n/has-translation";
import { useNoindex, usePages, useQueryText, useUrlFilters } from "@/hooks/use-url-filters";
import { matchesSearch } from "@/lib/pages/discovery";
import { resolveOption } from "@/lib/url-filters";
import { ContentCard } from "./content-card";
import { ActiveFilters, FilterPanel, FilterRow, FilterSearch, FilterSelect, NoMatches, ResultCount, ShowMore } from "./filter-controls";

const KEYS = ["format", "topic", "person", "role", "q"];
const FORMATS = ["article", "guide", "report"];
const ROLES = ["written", "reviewed"];
const PAGE_SIZE = 12;
const PREFIX = "resource-format";

// Resources: Articles / Guides / Reports, topics, and a person's written or
// reviewed work.
//
// - Format tabs show what actually exists; a format with nothing in it
//   (Reports today) is shown but disabled, never an empty destination.
// - The topic row and the person view combine with search and format.
// - The person is kept when the Written / Reviewed tab changes; Clear returns
//   to the collection's default view (All).
// - Everything is in the address (?format=, ?topic=, ?person=&role=, ?q=): an
//   incoming link selects it, Back restores it, and a plain open is always
//   the default view. Filtered views are noindex.
//
// `defaultFormat` is the collection this page opens on: "all" on /resources,
// "article" on /articles, "guide" on /guides.
export function ResourceExplorer({ items, defaultFormat = "all", initial = {} }) {
  const locale = useLocale();
  const t = useTranslations();
  const r = useTranslations("wc.resources");
  const f = useTranslations("wc.filters");
  const has = hasTranslation(t);

  const { values, update, clear, sync } = useUrlFilters(KEYS, initial);
  const [text, setText] = useQueryText(values.q, (q) => update({ q }, { replace: true }));
  const searchBox = useRef(null);
  const region = useRef(null);
  const focusIndex = useRef(null);

  // ── what exists ───────────────────────────────────────────────────────────
  const counts = useMemo(
    () => Object.fromEntries(FORMATS.map((format) => [format, items.filter((item) => item.type === format).length])),
    [items],
  );
  const available = ["all", ...FORMATS.filter((format) => counts[format] > 0)];
  const startFormat = available.includes(defaultFormat) ? defaultFormat : "all";
  const requested = values.format || startFormat;
  const format = available.includes(requested) ? requested : startFormat;

  const topicOptions = useMemo(() => {
    const topics = new Map();
    items.forEach((item) => {
      if (!item.family) return;
      const entry = topics.get(item.family) ?? { value: item.family, label: item.group || item.family, count: 0 };
      entry.count += 1;
      topics.set(item.family, entry);
    });
    return [...topics.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  const people = useMemo(() => {
    const map = new Map();
    const add = (person, role) => {
      if (!person?.slug) return;
      const entry = map.get(person.slug) ?? { person, written: 0, reviewed: 0 };
      entry[role] += 1;
      map.set(person.slug, entry);
    };
    items.forEach((item) => {
      add(item.author, "written");
      add(item.reviewer, "reviewed");
    });
    return [...map.values()].sort((a, b) => a.person.name.localeCompare(b.person.name));
  }, [items]);
  const personOptions = people.map((entry) => ({ value: entry.person.slug, label: entry.person.name }));

  // ── the view the address asks for ─────────────────────────────────────────
  const topic = resolveOption(values.topic, topicOptions);
  const person = resolveOption(values.person, personOptions);
  const role = ROLES.includes(values.role) ? values.role : "written";
  const chosen = people.find((entry) => entry.person.slug === person);
  const query = text.trim();
  const defaultView = format === startFormat;
  const filtering = Boolean(query || topic || person || !defaultView);

  const results = useMemo(
    () =>
      items.filter(
        (item) =>
          (format === "all" || item.type === format) &&
          (!topic || item.family === topic) &&
          (!person || (role === "written" ? item.author?.slug === person : item.reviewer?.slug === person)) &&
          matchesSearch({ ...item, aliases: [item.author?.name, item.reviewer?.name, ...(item.tags ?? [])].filter(Boolean) }, query),
      ),
    [items, format, topic, person, role, query],
  );

  const [pages, showMore] = usePages(`${format}|${query}|${topic}|${person}|${role}`);
  const limit = pages * PAGE_SIZE;
  const visible = results.slice(0, limit);
  const remaining = Math.max(0, results.length - limit);

  useNoindex(filtering || Object.values(values).some(Boolean));

  useEffect(() => {
    if (focusIndex.current === null) return;
    region.current?.querySelectorAll("[data-directory-item]")[focusIndex.current]?.querySelector("a")?.focus();
    focusIndex.current = null;
  }, [pages]);

  // ── actions ───────────────────────────────────────────────────────────────
  const chooseFormat = (next) => update({ format: next === startFormat ? "" : next });
  const choosePerson = (next) => update({ person: next, role: next ? (role === "reviewed" ? "reviewed" : "") : "" });
  const chooseRole = (next) => update({ role: next === "reviewed" ? "reviewed" : "" });
  const clearAll = () => {
    setText("");
    clear();
  };

  const formatLabel = (id) => r(`format.${id}`);
  const formatTabs = [
    { id: "all", label: formatLabel("all"), detail: items.length },
    ...FORMATS.map((id) => ({
      id,
      label: formatLabel(id),
      detail: counts[id] > 0 ? counts[id] : undefined,
      disabled: counts[id] === 0,
      disabledHint: r("notYet"),
    })),
  ];

  const roleTabs = ROLES.map((id) => ({
    id,
    label: r(`role.${id}`),
    detail: chosen ? chosen[id] : undefined,
    disabled: Boolean(chosen) && chosen[id] === 0 && id !== role,
    disabledHint: r("noneYet"),
  }));

  const chips = [
    !defaultView && {
      key: "format",
      kind: r("formatRow"),
      label: formatLabel(format),
      onRemove: () => update({ format: "" }),
    },
    query && {
      key: "q",
      kind: f("search"),
      label: `“${query}”`,
      onRemove: () => {
        setText("");
        update({ q: "" });
      },
    },
    topic && {
      key: "topic",
      kind: r("topicRow"),
      label: topicOptions.find((o) => o.value === topic)?.label ?? topic,
      onRemove: () => update({ topic: "" }),
    },
    person && {
      key: "person",
      kind: r(`role.${role}`),
      label: chosen?.person.name ?? person,
      onRemove: () => update({ person: "", role: "" }),
    },
  ].filter(Boolean);

  const noun = format === "all" ? r("nounAll") : format === "article" ? r("nounArticles") : format === "guide" ? r("nounGuides") : r("nounReports");
  const searchNoun = t("site.directory.articles");

  return (
    <Section className="scroll-mt-24 bg-[#f4f7f5] py-12 lg:py-16" id="resource-collection">
      <UrlWatch onChange={sync} />
      <div ref={region} role="region" aria-label={t("site.directory.browse", { noun: searchNoun })}>
        <FilterPanel>
          <p className="!mb-2 !mt-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">{r("formatRow")}</p>
          <TabList
            tabs={formatTabs}
            value={format}
            onChange={chooseFormat}
            label={r("formatRow")}
            idPrefix={PREFIX}
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible"
          />

          <div className="mt-5">
            <FilterSearch
              label={t("site.directory.searchIn", { noun: searchNoun })}
              placeholder={r("placeholder")}
              value={text}
              onChange={setText}
              inputRef={searchBox}
            />
          </div>

          <div className="mt-5 space-y-5">
            {topicOptions.length > 1 && (
              <FilterRow
                label={r("topicRow")}
                allLabel={r("allTopics")}
                options={topicOptions}
                value={topic}
                onChange={(next) => update({ topic: next })}
              />
            )}

            {personOptions.length > 0 && (
              <div className="grid items-end gap-4 sm:grid-cols-[minmax(0,22rem)_1fr]">
                <FilterSelect label={r("personRow")} value={person} onChange={choosePerson}>
                  <option value="">{r("everyone")}</option>
                  {personOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FilterSelect>
                {person && (
                  <TabList
                    tabs={roleTabs}
                    value={role}
                    onChange={chooseRole}
                    label={r("roleLabel", { name: chosen?.person.name ?? "" })}
                    idPrefix="resource-role"
                    controls={panelId(PREFIX)}
                    className="flex flex-wrap gap-2"
                  />
                )}
              </div>
            )}
          </div>

          <ActiveFilters items={chips} onClear={clearAll} />
        </FilterPanel>

        {chosen && (
          <div className="mb-6 max-w-md">
            <PersonCard
              person={chosen.person}
              role={r(`role.${role}`)}
              placeholderLabel={t("detail.people.placeholderProfile")}
            />
          </div>
        )}

        <ResultCount>
          <span>{filtering ? r("countMatching", { shown: visible.length, total: results.length, noun }) : r("count", { shown: visible.length, total: results.length, noun })}</span>
          {filtering && <span className="text-xs font-normal text-slate-600">{r("inCollection", { count: items.length })}</span>}
        </ResultCount>

        <div id={panelId(PREFIX)} role="tabpanel" aria-labelledby={tabId(PREFIX, format)}>
          {results.length > 0 ? (
            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <div key={`${item.type}-${item.id}`} data-directory-item className="h-full">
                  <ContentCard page={item} locale={locale} t={t} has={has} />
                </div>
              ))}
            </div>
          ) : (
            <NoMatches
              title={r("emptyTitle")}
              text={person ? r("emptyPerson", { name: chosen?.person.name ?? "", role: r(`roleVerb.${role}`) }) : r("emptyText")}
              onClear={filtering ? clearAll : undefined}
              clearLabel={f("clear")}
            />
          )}
        </div>

        {remaining > 0 && (
          <ShowMore
            label={r("showMore", { count: Math.min(PAGE_SIZE, remaining) })}
            remaining={r("remaining", { count: remaining })}
            onClick={() => {
              focusIndex.current = limit;
              showMore();
            }}
          />
        )}
      </div>
    </Section>
  );
}
