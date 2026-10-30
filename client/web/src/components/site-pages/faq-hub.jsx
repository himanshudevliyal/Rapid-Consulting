"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { BTN_LIME, EYEBROW, H2, WRAP } from "@/components/home/styles";
import { HeroCard } from "@/components/pages/b2d-parts";
import { FaqCardList } from "@/components/pages/faq-accordion";
import { stripTags } from "@/lib/content/adapters";
import { enquiryCard } from "@/lib/pages/b2d-forms";
import { b2dText } from "@/lib/pages/b2d-text";
import { matchesSearch } from "@/lib/pages/discovery";
import { cn } from "@/lib/utils";
import { NAV_OFFSET } from "./shared";

// The FAQ hub (Figma 1319-64931), a block inside a site page:
//
//   1. "Find your question": a white card with a search box and one row per
//      topic (with its number of questions) on a sage band
//   2. a sticky "Jump to:" bar (topics and "Ask us"); left out when the page's
//      masthead already sets its own sticky menu (nav_label)
//   3. one section per topic, alternating white and grey: the topic on the
//      left, its questions on the right (the first one open) and a lime
//      button at the end
//   4. "Ask us": the shared enquiry card on the navy closing panel
//
// Searching filters the questions of every topic in place (no navigation) and
// opens the answers it finds; topics with no match disappear until the search
// is cleared. ?topic=<key> (initialTopic) scrolls to that topic once.
//
//   topics:  [{ key, title, items: [{ question, answerHtml }] }]
//   extras:  { [topicKey]: { tagline, ctaLabel, ctaHref } }   optional per-topic text and button
//   idPrefix, label: as before (section ids and the sticky bar's name)
//   showNav, pageId, pageTitle: see FaqHubBlock
export function FaqHub({ topics, initialTopic = "", idPrefix, label, extras = {}, showNav = true, pageId, pageTitle }) {
  const t = useTranslations();
  const tx = b2dText(t);
  const [query, setQuery] = useState("");
  const searchBox = useRef(null);

  const sectionId = (key) => `${idPrefix}-${key}`;
  const askId = `${idPrefix}-ask`;
  const searching = query.trim().length > 0;

  const count = (n) => (n === 1 ? tx("faqs.oneQuestion", "1 question") : tx("faqs.manyQuestions", "{count} questions", { count: n }));

  // Every question keeps its original number, so its link (#<prefix>-<topic>-q<n>) is stable.
  const shaped = useMemo(
    () =>
      topics.map((topic) => ({
        ...topic,
        entries: topic.items.map((item, index) => ({
          id: `${idPrefix}-${topic.key}-q${index + 1}`,
          question: item.question,
          answerHtml: item.answerHtml,
          doc: { title: item.question, description: stripTags(item.answerHtml) },
        })),
      })),
    [topics, idPrefix],
  );

  const visible = useMemo(
    () =>
      shaped
        .map((topic) => ({ ...topic, entries: searching ? topic.entries.filter((entry) => matchesSearch(entry.doc, query.trim())) : topic.entries }))
        .filter((topic) => topic.entries.length > 0),
    [shaped, query, searching],
  );
  const matchCount = visible.reduce((sum, topic) => sum + topic.entries.length, 0);
  const total = shaped.reduce((sum, topic) => sum + topic.entries.length, 0);

  // ?topic=<key>: bring that topic into view once (unless the address names a question).
  useEffect(() => {
    if (!initialTopic || window.location.hash) return;
    const target = document.getElementById(sectionId(initialTopic));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic]);

  const goToResults = (event) => {
    event.preventDefault();
    const first = visible[0];
    if (first) document.getElementById(sectionId(first.key))?.scrollIntoView({ block: "start" });
  };

  const clear = () => {
    setQuery("");
    searchBox.current?.focus();
  };

  const navSections = [
    ...topics.map((topic) => ({ id: sectionId(topic.key), title: topic.title })),
    { id: askId, title: tx("faqs.ask.nav", "Ask us") },
  ];

  const askSelect = {
    label: tx("faqs.ask.topic", "Which topic is it about?"),
    required: false,
    placeholder: tx("faqs.ask.choose", "Choose a topic"),
    options: [...topics.map((topic) => topic.title), tx("faqs.ask.other", "Something else")],
  };

  return (
    <div className="b2d-nav">
      {/* 1. Find your question */}
      <section aria-labelledby={`${idPrefix}-find-title`} className="bg-[#eef3f0] py-10 md:py-14">
        <div className={WRAP}>
          <HeroCard id={`${idPrefix}-find-title`} title={tx("faqs.find.title", "Find your question")} className="mx-auto max-w-5xl">
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
              <div className="min-w-0">
                <form role="search" onSubmit={goToResults}>
                  <label htmlFor={`${idPrefix}-search`} className="mb-2 block text-[13px] font-semibold text-[#09263e]">
                    {tx("faqs.find.label", "Search all questions")}
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#1f5d57]" aria-hidden="true" />
                      <input
                        id={`${idPrefix}-search`}
                        ref={searchBox}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={tx("faqs.find.placeholder", "For example CLU, stamp duty or a callback")}
                        autoComplete="off"
                        className="block h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-[15px] text-[#09263e] placeholder:text-slate-500 focus-visible:border-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]/25"
                      />
                    </div>
                    <button type="submit" className={BTN_LIME}>
                      {tx("faqs.find.submit", "Search")}
                    </button>
                  </div>
                </form>
                <p role="status" aria-live="polite" className="m-0! mt-3! min-h-5 text-sm text-slate-700">
                  {searching
                    ? matchCount > 0
                      ? tx("faqs.find.matches", "{shown} of {total} questions match", { shown: matchCount, total })
                      : tx("faqs.find.none", "No question matches. Try fewer words, or ask us below.")
                    : ""}
                  {searching && (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={clear}
                        className="font-semibold text-[#09263e] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e]"
                      >
                        {tx("faqs.find.clear", "Clear search")}
                      </button>
                    </>
                  )}
                </p>
              </div>

              <ul className="m-0 grid list-none gap-2 p-0" aria-label={tx("faqs.find.topics", "Topics")}>
                {shaped.map((topic) => (
                  <li key={topic.key} className="m-0">
                    <a
                      href={`#${sectionId(topic.key)}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[#09263e]! no-underline transition-colors hover:border-[#09263e] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                    >
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold leading-snug">{topic.title}</span>
                        <span className="block text-sm text-slate-600">{count(topic.entries.length)}</span>
                      </span>
                      <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </HeroCard>
        </div>
      </section>

      {/* 2. Jump to */}
      {showNav && navSections.length > 1 && (
        <ActiveSectionNav
          title={t("service.onThisPage")}
          label={label || tx("faqs.nav.label", "Jump to")}
          contextLabel={tx("faqs.nav.lead", "Jump to:")}
          sections={navSections}
        />
      )}

      {/* 3. Topics */}
      {visible.map((topic, index) => {
        const extra = extras[topic.key] ?? {};
        const ctaHref = extra.ctaHref || `#${askId}`;
        const ctaLabel = extra.ctaLabel || tx("faqs.topicCta", "Ask us about {topic}", { topic: topic.title });
        return (
          <section
            key={topic.key}
            id={sectionId(topic.key)}
            aria-labelledby={`${sectionId(topic.key)}-title`}
            className={cn(NAV_OFFSET, "py-12 sm:py-16", index % 2 === 0 ? "bg-white" : "bg-[#f4f7f5]")}
          >
            <div className={cn(WRAP, "grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14")}>
              <div className="min-w-0">
                <p className={EYEBROW}>{count(topic.entries.length)}</p>
                <h2 id={`${sectionId(topic.key)}-title`} className={H2}>
                  {topic.title}
                </h2>
                {extra.tagline && <p className="mb-0! mt-4! max-w-md text-base leading-7 text-slate-700">{extra.tagline}</p>}
              </div>
              <div className="min-w-0">
                <FaqCardList
                  key={`${topic.key}-${searching ? "found" : "all"}`}
                  items={topic.entries}
                  defaultOpen={searching ? "all" : "first"}
                />
                <div className="mt-6">
                  <a href={ctaHref} className={BTN_LIME}>
                    {ctaLabel}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {searching && matchCount === 0 && (
        <section className="bg-white py-12">
          <div className={WRAP}>
            <p className="m-0! rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] p-6 text-slate-700">
              {tx("faqs.find.noneLong", "Nothing matches your search. Clear it to see every question, or ask us below.")}
            </p>
          </div>
        </section>
      )}

      {/* 4. Ask us */}
      <ClosingEnquiryPanel
        id={askId}
        className={NAV_OFFSET}
        eyebrow={tx("faqs.ask.eyebrow", "Ask us")}
        heading={tx("faqs.ask.heading", "Didn't find your question?")}
        intro={tx("faqs.ask.intro", "Ask in your own words. A Rapid expert will reply with the next step.")}
        photoNote={tx("form.photoNote", "Placeholder: a factory site in Haryana. Final photography to be supplied by Rapid.")}
        card={enquiryCard(tx, {
          title: tx("faqs.ask.cardTitle", "Ask us your question."),
          source: "faq-hub",
          pageId,
          pageTitle,
          serviceName: tx("faqs.ask.service", "FAQ question"),
          submit: tx("faqs.ask.submit", "Send my question"),
          activityLabel: tx("faqs.ask.activity", "Your question"),
          select: askSelect,
          fields: ["activity"],
        })}
      />
    </div>
  );
}
