"use client";

import { Children, useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

// Item widths: one card (with a glimpse of the next) on phones, two on tablets,
// three on desktop. The gap is 1.25rem.
const ITEM = "snap-start shrink-0 basis-[86%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]";

const circle =
  "inline-flex size-11 items-center justify-center rounded-full border border-[#09263e]/25 bg-white text-[#09263e] transition-colors hover:bg-[#eaff6b] disabled:cursor-not-allowed disabled:hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

/**
 * Manual card carousel (no autoplay). Controls sit above the cards, at the right
 * of the optional `lead` content; the counter reads "1-3 / 7". Scrolling only
 * moves the track, never the page. Ends are disabled, not wrapped.
 *
 *   <Carousel label="Case studies" previous="Previous" next="Next" lead={<Heading/>}>
 *     {cards}
 *   </Carousel>
 */
// `showCounter={false}` hides the "1-3 / 7" counter; `controlClassName` restyles the
// previous / next buttons.
export function Carousel({
  label,
  previous,
  next,
  lead,
  children,
  className,
  trackClassName,
  itemClassName,
  showCounter = true,
  controlClassName,
}) {
  const uid = useId();
  const track = useRef(null);
  const items = Children.toArray(children);
  const total = items.length;
  const [range, setRange] = useState({ first: 1, last: Math.min(total, 3) });

  const measure = useCallback(() => {
    const node = track.current;
    if (!node || !node.children.length) return;
    const first = node.children[0];
    const second = node.children[1];
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    if (!step) return;
    const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 2;
    const perView = Math.max(1, Math.round(node.clientWidth / step));
    const start = Math.min(total, Math.max(1, Math.round(node.scrollLeft / step) + 1));
    const last = atEnd ? total : Math.min(total, start + perView - 1);
    const from = atEnd ? Math.max(1, total - perView + 1) : start;
    setRange((current) => (current.first === from && current.last === last ? current : { first: from, last }));
  }, [total]);

  useEffect(() => {
    measure();
    const node = track.current;
    if (!node) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const move = (direction) => {
    const node = track.current;
    if (!node || !node.children.length) return;
    const first = node.children[0];
    const second = node.children[1];
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({ left: direction * step, behavior: reduce ? "auto" : "smooth" });
  };

  const counter = range.first === range.last ? `${range.first} / ${total}` : `${range.first}-${range.last} / ${total}`;
  const atStart = range.first <= 1;
  const atEnd = range.last >= total;

  return (
    <div className={className} role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">{lead}</div>
        <div className="flex shrink-0 items-center gap-3">
          {showCounter && (
            <span className="min-w-[4.5rem] text-sm font-semibold tabular-nums text-slate-700" aria-live="polite">
              {counter}
            </span>
          )}
          <button type="button" className={cn(circle, controlClassName)} aria-label={previous} aria-controls={`${uid}-track`} disabled={atStart} onClick={() => move(-1)}>
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className={cn(circle, controlClassName)} aria-label={next} aria-controls={`${uid}-track`} disabled={atEnd} onClick={() => move(1)}>
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        id={`${uid}-track`}
        className={cn(
          "relative m-0 mt-6 flex list-none snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth p-0 pb-3 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden",
          trackClassName,
        )}
      >
        {items.map((item, index) => (
          <li
            key={item.key ?? index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${total}`}
            className={cn("m-0 flex min-w-0", ITEM, itemClassName)}
          >
            <div className="w-full min-w-0 [&>*]:h-full">{item}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Carousel;
