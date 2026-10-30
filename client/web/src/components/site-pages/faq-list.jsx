"use client";

import { useRef } from "react";

import { FaqAccordion } from "@/components/pages/faq-accordion";
import { escapeHtml } from "@/lib/content/site-page-adapters";

// The shared FAQ accordion (answers stay in the HTML, "+" indicator, expanded
// state exposed by aria-expanded) for the faq and faq_hub blocks.
//
// Opening or closing an answer never navigates: the triggers are buttons, not
// "#" links, so the page does not jump to the top. The one thing that can still
// move the reading position is the layout changing above the viewport, so the
// clicked question is held where it was (a no-op when the browser's own scroll
// anchoring already did it). Section links in the sticky menu measure their
// target when clicked, so they stay correct after an answer changed the height.
//
//   items: [{ question, answerHtml }]   idPrefix: unique per block
export function SiteFaqList({ items, idPrefix }) {
  const root = useRef(null);

  const hold = (event) => {
    const trigger = event.target?.closest?.("[data-slot='accordion-trigger']");
    if (!trigger || !root.current?.contains(trigger)) return;
    const before = trigger.getBoundingClientRect().top;
    const settle = () => {
      if (!trigger.isConnected) return;
      const shift = trigger.getBoundingClientRect().top - before;
      if (Math.abs(shift) > 1) window.scrollBy({ top: shift, left: 0, behavior: "instant" });
    };
    window.requestAnimationFrame(() => window.requestAnimationFrame(settle));
  };

  return (
    <div ref={root} className="faq-list" onClickCapture={hold}>
      <FaqAccordion
        items={items.map((item, index) => ({
          id: `${idPrefix}-q${index + 1}`,
          value: `${idPrefix}-q${index + 1}`,
          questionHtml: escapeHtml(item.question),
          answerHtml: item.answerHtml,
        }))}
      />
    </div>
  );
}
