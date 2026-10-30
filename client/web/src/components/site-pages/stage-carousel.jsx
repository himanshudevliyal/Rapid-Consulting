"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

const isExternal = (href) => /^https?:\/\//i.test(href);

// The service cards of a stage section: a row that scrolls sideways, with
// previous / next buttons.
//   cards:   [{ title, hint, href }]  href is already localised ("" = no link:
//            the card shows without an arrow and is not a link)
//   heading: the small label on the left of the arrows ("Services we provide")
//   navy:    the section is on the dark band (the cards stay white)
//   labels:  { region, prev, next }   texts for assistive technology
// Scrolling is a plain overflow container (works with touch, trackpad and the
// keyboard); the buttons move it by about one card and are disabled at the ends.
export function StageCarousel({ cards, navy = false, heading, labels }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 2, end: max <= 2 || el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [measure, cards.length]);

  const step = (direction) => {
    const el = track.current;
    if (!el) return;
    const first = el.querySelector("li");
    const gap = 16;
    const amount = (first ? first.getBoundingClientRect().width + gap : el.clientWidth * 0.8) * direction;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: amount, behavior: reduced ? "instant" : "smooth" });
  };

  const arrow = cn(
    "inline-flex size-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
    navy
      ? "border-white/40 text-white hover:bg-white/10 focus-visible:ring-[#eaff6b] focus-visible:ring-offset-[#09263e] disabled:hover:bg-transparent"
      : "border-[#09263e]/25 text-[#09263e] hover:border-[#09263e] focus-visible:ring-[#09263e] disabled:hover:border-[#09263e]/25",
  );

  return (
    <div className="wc2-carousel">
      <div className="mb-3 flex items-center justify-between gap-3">
        {heading ? (
          <p className={cn("wc2-eyebrow !m-0", navy && "wc2-eyebrow--on-navy")}>{heading}</p>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" className={arrow} onClick={() => step(-1)} disabled={edges.start} aria-label={labels.prev}>
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className={arrow} onClick={() => step(1)} disabled={edges.end} aria-label={labels.next}>
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        aria-label={labels.region}
        className="m-0 flex list-none snap-x snap-proximity gap-4 overflow-x-auto p-0 pb-2 [scrollbar-width:thin]"
      >
        {cards.map((card, index) => {
          const body = (
            <>
              <span className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-lg bg-[#eef3f0] text-[#09263e]"
                >
                  <FileText className="size-5" />
                </span>
                {card.href && <ArrowUpRight className="size-5 shrink-0 text-[#09263e]" aria-hidden="true" />}
              </span>
              <span className="mt-4 block text-base font-semibold leading-snug text-[#09263e]">{card.title}</span>
              {card.hint && (
                <span className="mt-1.5 line-clamp-2 block text-sm leading-6 text-slate-600">{card.hint}</span>
              )}
            </>
          );
          const shell =
            "relative flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left no-underline";
          return (
            <li key={`${card.title}-${index}`} className="flex w-[15.5rem] shrink-0 snap-start sm:w-[16.5rem]">
              {card.href ? (
                isExternal(card.href) ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(shell, "transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(9,38,62,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2")}
                  >
                    {body}
                  </a>
                ) : (
                  <Link
                    href={card.href}
                    className={cn(shell, "transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(9,38,62,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2")}
                  >
                    {body}
                  </Link>
                )
              ) : (
                <div className={shell}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
