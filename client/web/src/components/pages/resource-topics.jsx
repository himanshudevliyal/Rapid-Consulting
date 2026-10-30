"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, Search } from "lucide-react";

import { BTN_LIME } from "@/components/home/styles";
import { formatDate } from "@/lib/format-date";
import { fillTokens } from "@/lib/pages/managed-view";
import { filterKey } from "@/lib/url-filters";
import { cn } from "@/lib/utils";
import { Chip } from "./filter-controls";

const SHOWN = 6;

/**
 * "By topic" on the Resources hub: one chip per topic (the category an article
 * is filed under, with its count) and the latest articles of the chosen topic
 * as cards. Choosing a topic changes the cards in place (no navigation, no
 * scroll). "View all articles" opens the articles index on the same topic
 * (?topic=), which the Resources explorer already understands.
 *
 *   items   article summaries (adapters.articleToSummary), newest first
 *   labels  { all, topicRow, viewAll, read, empty, count, reviewed }
 */
export function ResourceTopics({ items, locale, labels, indexHref }) {
  const [topic, setTopic] = useState("");

  const topics = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (!item.family) return;
      const entry = map.get(item.family) ?? { value: item.family, label: item.group || item.family, count: 0 };
      entry.count += 1;
      map.set(item.family, entry);
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  const shown = items.filter((item) => !topic || item.family === topic).slice(0, SHOWN);
  const href = topic ? `${indexHref}?topic=${encodeURIComponent(topic)}` : indexHref;

  return (
    <div>
      {topics.length > 1 && (
        <div role="group" aria-label={labels.topicRow} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          <Chip pressed={!topic} onClick={() => setTopic("")}>
            {labels.all}
          </Chip>
          {topics.map((option) => (
            <Chip key={option.value} pressed={topic === option.value} onClick={() => setTopic(topic === option.value ? "" : option.value)}>
              {option.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  topic === option.value ? "bg-white/20 text-white" : "bg-[#e8efec] text-[#1f5d57]",
                )}
              >
                {option.count}
              </span>
            </Chip>
          ))}
        </div>
      )}

      <p role="status" aria-live="polite" className="m-0! mt-5! text-sm text-slate-600">
        {labels.count.replace("{shown}", String(shown.length)).replace("{total}", String(items.filter((item) => !topic || item.family === topic).length))}
      </p>

      {shown.length > 0 ? (
        <ul className="m-0 mt-4 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((item) => (
            <li key={item.id} className="m-0">
              <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(9,38,62,0.55)]">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-lg bg-[#eef3f0] text-[#09263e]">
                    <FileText className="size-5" />
                  </span>
                  {item.group && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#922e0c]">{item.group}</span>
                  )}
                </span>
                <h3 className="m-0! mt-4! text-lg! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
                  <Link href={item.href} className="text-inherit! no-underline hover:underline focus-visible:underline">
                    {item.title}
                  </Link>
                </h3>
                {item.description && (
                  <p className="m-0! mt-2! line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
                )}
                <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5 text-sm">
                  <span className="text-slate-600">
                    {item.reviewer && item.reviewedAt ? labels.reviewed.replace("{date}", formatDate(item.reviewedAt, locale)) : ""}
                  </span>
                  <Link
                    href={item.href}
                    aria-label={`${labels.read}: ${item.title}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#09263e]! no-underline hover:underline"
                  >
                    {labels.read}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </span>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0! mt-4! rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">{labels.empty}</p>
      )}

      <div className="mt-8">
        <Link href={href} className={BTN_LIME}>
          {labels.viewAll}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/**
 * "By topic" as the page's own featured list (the managed by-topic section): a
 * search box, one chip per topic (plus "All"), a count line and a scrollable
 * two-column list of rows (title, pill, topic, meta line). A row links to the
 * guide or article of the same title when the site has one.
 *
 *   items   [{ title, tag, topic, meta, href }]   href "" = no page yet
 *   chips   topic names (the first chip "All" is added)
 *   labels  { all, search, placeholder, button, count, empty, topicRow, viewAll }
 */
export function ResourceFeatured({ items, chips, labels, indexHref }) {
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const query = text.trim().toLowerCase();

  const shown = items.filter(
    (item) =>
      (!topic || filterKey(item.topic) === topic) &&
      (!query || [item.title, item.tag, item.topic].some((value) => String(value || "").toLowerCase().includes(query))),
  );

  return (
    <div>
      {labels.placeholder && (
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="mb-5 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#1f5d57]" aria-hidden="true" />
            <input
              type="search"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={labels.placeholder}
              aria-label={labels.search || labels.placeholder}
              autoComplete="off"
              className="block h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-[15px] text-[#09263e] placeholder:text-slate-500 focus-visible:border-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]/25"
            />
          </div>
          {labels.button && (
            <button type="submit" className={BTN_LIME}>
              {labels.button}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </form>
      )}

      {chips.length > 0 && (
        <div role="group" aria-label={labels.topicRow} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          <Chip pressed={!topic} onClick={() => setTopic("")}>
            {labels.all}
          </Chip>
          {chips.map((chip) => {
            const value = filterKey(chip);
            return (
              <Chip key={value} pressed={topic === value} onClick={() => setTopic(topic === value ? "" : value)}>
                {chip}
              </Chip>
            );
          })}
        </div>
      )}

      <p role="status" aria-live="polite" className="m-0! mt-5! text-sm text-slate-600">
        {fillTokens(labels.count, { shown: shown.length, total: shown.length })}
      </p>

      {shown.length > 0 ? (
        <ul className="m-0 mt-4 grid max-h-[30rem] list-none gap-3 overflow-y-auto p-0 pr-1 md:grid-cols-2">
          {shown.map((item, index) => {
            const body = (
              <>
                <span className="min-w-0">
                  <span className="block text-base font-semibold leading-snug text-[#09263e] [overflow-wrap:anywhere]">{item.title}</span>
                  {(item.tag || item.topic) && (
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {item.tag && <span className="rounded-full bg-[#eaf0ec] px-2.5 py-1 font-semibold text-[#09263e]">{item.tag}</span>}
                      {item.topic && <span className="font-semibold uppercase tracking-[0.12em] text-[#922e0c]">{item.topic}</span>}
                    </span>
                  )}
                  {item.meta && <span className="mt-2 block text-xs leading-5 text-slate-600">{item.meta}</span>}
                </span>
                <ArrowUpRight className="size-5 shrink-0 text-[#09263e]" aria-hidden="true" />
              </>
            );
            const box = "flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4";
            return (
              <li key={`${index}-${item.title}`} className="m-0">
                {item.href ? (
                  <Link href={item.href} className={cn(box, "text-[#09263e]! no-underline transition-colors hover:border-[#09263e]/50 hover:bg-[#f8faf9]")}>
                    {body}
                  </Link>
                ) : (
                  <div className={box}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="m-0! mt-4! rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">{labels.empty}</p>
      )}

      {labels.viewAll && (
        <div className="mt-8">
          <Link href={indexHref} className={BTN_LIME}>
            {labels.viewAll}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
