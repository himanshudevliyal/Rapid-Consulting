"use client";

import { useEffect, useState } from "react";

import { SectionNav } from "./section-nav";

const px = (value) => Number.parseFloat(value) || 0;

// The line a section must pass to count as "reached", and where a jumped-to
// heading is placed: below the site header AND the sticky sub-menu, measured
// now (both can change height: a wrapping sub-menu, a header state change).
function readOffset() {
  const style = getComputedStyle(document.documentElement);
  const header = px(style.getPropertyValue("--site-header-h")) || px(style.getPropertyValue("--header-height")) || 80;
  const bar = document.querySelector("[data-section-nav]")?.getBoundingClientRect().height || px(style.getPropertyValue("--section-nav-h")) || 52;
  return Math.round(header + bar + 16);
}

/**
 * Wraps SectionNav with scroll-spy active-section detection and a reliable
 * jump to a section.
 *
 * - The active section is recomputed on scroll, on resize and whenever the
 *   page's height changes (ResizeObserver) - an FAQ answer opening or closing
 *   above or below never leaves the wrong topic highlighted.
 * - Choosing a topic scrolls its heading to just below the header + sub-menu
 *   and keeps re-aiming for a moment while content settles (images, an
 *   answer still animating), until the reader scrolls themselves.
 *
 * Props are identical to SectionNav (sections, title, label, contextLabel);
 * no activeId needed (this component computes it).
 */
export function ActiveSectionNav({ sections = [], title, label, contextLabel }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const idsKey = sections.map((section) => section.id).join("|");

  useEffect(() => {
    const ids = idsKey ? idsKey.split("|") : [];
    if (!ids.length) return undefined;

    // ── which section is current ───────────────────────────────────────────
    let frame = 0;
    const compute = () => {
      frame = 0;
      const line = readOffset() + 8;
      let best = null;
      let bestTop = -Infinity;
      let nearest = null;
      let nearestTop = Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= line && top > bestTop) {
          best = id;
          bestTop = top;
        }
        if (top < nearestTop) {
          nearest = id;
          nearestTop = top;
        }
      }
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const last = [...ids].reverse().find((id) => document.getElementById(id));
      setActiveId(atEnd && last ? last : (best ?? nearest ?? ids[0]));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    // ── going to a section ─────────────────────────────────────────────────
    let settle = null; // { cancel }
    const stopSettling = () => {
      settle?.cancel();
      settle = null;
    };

    const goTo = (target, id) => {
      stopSettling();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const place = (behavior) => {
        const top = target.getBoundingClientRect().top + window.scrollY - readOffset();
        window.scrollTo({ top: Math.max(0, top), behavior });
      };
      place(reduced ? "instant" : "smooth");
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`);
      setActiveId(id);

      // Re-aim once the scroll has come to rest, a few times at most.
      let raf = 0;
      let lastY = window.scrollY;
      let restFrames = 0;
      let aims = 0;
      const startedAt = performance.now();
      const watch = () => {
        const y = window.scrollY;
        restFrames = Math.abs(y - lastY) < 0.5 ? restFrames + 1 : 0;
        lastY = y;
        if (restFrames >= 8) {
          const delta = target.getBoundingClientRect().top - readOffset();
          if (Math.abs(delta) > 2 && aims < 3) {
            aims += 1;
            place("instant");
            restFrames = 0;
          } else {
            return;
          }
        }
        if (performance.now() - startedAt < 2500) raf = requestAnimationFrame(watch);
      };
      raf = requestAnimationFrame(watch);
      settle = { cancel: () => cancelAnimationFrame(raf) };
    };

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('[data-section-nav] a[href^="#"]') : null;
      if (!link) return;
      let id = "";
      try {
        id = decodeURIComponent(link.getAttribute("href").slice(1));
      } catch {
        return;
      }
      const target = ids.includes(id) ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      goTo(target, id);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("click", onClick);
    // The reader taking over ends any re-aiming.
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((name) =>
      window.addEventListener(name, stopSettling, { passive: true }),
    );
    // Height changes anywhere on the page (FAQ answers, images, fonts).
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(document.body);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      stopSettling();
      observer?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("click", onClick);
      ["wheel", "touchstart", "keydown", "pointerdown"].forEach((name) => window.removeEventListener(name, stopSettling));
    };
  }, [idsKey]);

  return <SectionNav sections={sections} title={title} label={label} activeId={activeId} contextLabel={contextLabel} />;
}
