"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Minus, Plus } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const OFFSET = "scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]";

// Answers stay in the HTML (forceMount) so they are readable without JavaScript
// and by search engines.
//
// Opening or closing a question is a button press: no navigation, no jump to
// the top, and whatever the reader was looking at stays where it is. Radix
// exposes aria-expanded on every trigger. A link to a question (#its-id)
// opens it and brings it below the sticky header and sub-menu.
export function FaqAccordion({ items }) {
  const [open, setOpen] = useState([]);
  const openRef = useRef(open);
  const root = useRef(null);

  const change = useCallback((next) => {
    // The trigger whose answer is opening / closing: keep it where it is.
    const changed = [...next, ...openRef.current].find((value) => next.includes(value) !== openRef.current.includes(value));
    const trigger = root.current?.querySelector(`[data-faq-value="${CSS.escape(changed ?? "")}"] [data-slot="accordion-trigger"]`);
    const before = trigger?.getBoundingClientRect().top;

    openRef.current = next;
    setOpen(next);

    if (before === undefined) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!trigger.isConnected) return;
        const moved = trigger.getBoundingClientRect().top - before;
        if (Math.abs(moved) > 1) window.scrollBy({ top: moved, behavior: "instant" });
      }),
    );
  }, []);

  // #question-id in the address (on load and when it changes) opens that question.
  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const item = items.find((entry) => entry.id && entry.id === id);
      if (!item) return;
      if (!openRef.current.includes(item.value)) {
        openRef.current = [...openRef.current, item.value];
        setOpen(openRef.current);
      }
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [items]);

  return (
    <div ref={root}>
      <Accordion type="multiple" value={open} onValueChange={change}>
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            id={item.id || undefined}
            data-faq-value={item.value}
            className={`faq-item border-b-0 ${OFFSET}`}
          >
            <AccordionTrigger className="faq-trigger">
              <span dangerouslySetInnerHTML={{ __html: item.questionHtml }} />
            </AccordionTrigger>
            <AccordionContent forceMount className="faq-answer">
              <div className="prose" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/**
 * The Figma FAQ list (FAQ hub topic sections, Resources preview): white rounded
 * rows with a round plus / minus, the first question open by default.
 *
 *   items: [{ id, question, answerHtml }]   question = plain text; answerHtml = trusted editor HTML
 *   defaultOpen: "first" | "all" | "none"   which answers start open
 *
 * Same behaviour contract as FaqAccordion: every trigger is a real button
 * (aria-expanded / aria-controls), opening or closing never navigates or jumps
 * (the pressed question keeps its place on screen), answers stay in the HTML
 * (closed ones are `hidden`), and a link to #question-id opens that question
 * and brings it below the sticky header and sub-menu.
 */
export function FaqCardList({ items, defaultOpen = "first", className }) {
  const root = useRef(null);
  const [open, setOpen] = useState(() =>
    defaultOpen === "all" ? items.map((item) => item.id) : defaultOpen === "first" && items[0] ? [items[0].id] : [],
  );
  const openRef = useRef(open);

  const commit = useCallback((next) => {
    openRef.current = next;
    setOpen(next);
  }, []);

  const toggle = useCallback(
    (id) => {
      const trigger = root.current?.querySelector(`[data-faq-trigger="${CSS.escape(id)}"]`);
      const before = trigger?.getBoundingClientRect().top;
      const current = openRef.current;
      commit(current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
      if (before === undefined) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!trigger.isConnected) return;
          const moved = trigger.getBoundingClientRect().top - before;
          if (Math.abs(moved) > 1) window.scrollBy({ top: moved, behavior: "instant" });
        }),
      );
    },
    [commit],
  );

  // #question-id in the address (on load and when it changes) opens that question.
  useEffect(() => {
    const reveal = () => {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      if (!openRef.current.includes(item.id)) commit([...openRef.current, item.id]);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [items, commit]);

  return (
    <div
      ref={root}
      className={cn("divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white", className)}
    >
      {items.map((item) => {
        const expanded = open.includes(item.id);
        const panel = `${item.id}-answer`;
        return (
          <div key={item.id} id={item.id} className={OFFSET}>
            <h3 className="m-0!">
              <button
                type="button"
                data-faq-trigger={item.id}
                aria-expanded={expanded}
                aria-controls={panel}
                onClick={() => toggle(item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 bg-transparent px-5 py-4 text-left text-base font-semibold leading-snug text-[#09263e] transition-colors hover:bg-[#f6f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#09263e] sm:px-6"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    expanded ? "bg-[#eaff6b] text-[#09263e]" : "bg-[#eaf0ec] text-[#09263e]",
                  )}
                >
                  {expanded ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </span>
              </button>
            </h3>
            <div
              id={panel}
              role="region"
              aria-label={item.question}
              hidden={!expanded}
              className="px-5 pb-5 text-[15px] leading-7 text-slate-700 sm:px-6 [&_a]:font-semibold [&_a]:text-[#09263e] [&_p]:m-0 [&_p+p]:mt-3 [&_ul]:my-2 [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: item.answerHtml }}
            />
          </div>
        );
      })}
    </div>
  );
}
