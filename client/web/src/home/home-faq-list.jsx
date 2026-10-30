"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Home FAQ accordion. The first question is open by default; any number can be
 * open. Each trigger is a real button (aria-expanded, aria-controls): opening or
 * closing never navigates, and the page keeps the reader's position - the
 * trigger that was pressed stays where it was on screen, even when the answer
 * above it changes height. Answers are in the markup (closed ones `hidden`).
 *
 *   items: [{ id, question, answerHtml }]  (answerHtml is trusted, compiler-made HTML)
 */
export function HomeFaqList({ items }) {
  const uid = useId();
  const root = useRef(null);
  // A question without an answer yet (managed page) stays closed and does not toggle.
  const [open, setOpen] = useState(() => {
    const first = items.find((item) => item.answerHtml);
    return first ? [first.id] : [];
  });

  const toggle = useCallback((id) => {
    const trigger = root.current?.querySelector(`[data-faq-trigger="${CSS.escape(id)}"]`);
    const before = trigger?.getBoundingClientRect().top;
    setOpen((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
    if (before === undefined) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!trigger.isConnected) return;
        const moved = trigger.getBoundingClientRect().top - before;
        if (Math.abs(moved) > 1) window.scrollBy({ top: moved, behavior: "instant" });
      }),
    );
  }, []);

  return (
    <div ref={root} className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((item) => {
        const expanded = open.includes(item.id) && Boolean(item.answerHtml);
        const panel = `${uid}-${item.id}`;
        return (
          <div key={item.id}>
            <h3 className="m-0!">
              <button
                type="button"
                data-faq-trigger={item.id}
                aria-expanded={expanded}
                aria-controls={item.answerHtml ? panel : undefined}
                onClick={() => item.answerHtml && toggle(item.id)}
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
            {item.answerHtml && (
              <div
                id={panel}
                role="region"
                hidden={!expanded}
                className="px-5 pb-5 text-[15px] leading-7 text-slate-700 sm:px-6 [&_a]:font-semibold [&_a]:text-[#09263e] [&_p]:m-0 [&_p+p]:mt-3"
                dangerouslySetInnerHTML={{ __html: item.answerHtml }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
