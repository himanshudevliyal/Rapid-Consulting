"use client";

import { useEffect, useRef } from "react";

const MAX_LABEL = 26;

// Section names can be whole sentences ("What Udyam registration means for a
// small business?"). The sticky bar shows a short form of them; the full
// text stays in the tooltip and the section's own heading.
export function shortNavLabel(text = "", max = MAX_LABEL) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const lead = clean.split(/\s*[:—–|?(]\s*|\s+-\s+/)[0] || clean;
  if (lead.length <= max) return lead;
  let out = "";
  for (const word of lead.split(" ")) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > max) break;
    out = next;
  }
  const base = (out || Array.from(lead).slice(0, max).join("")).replace(/[,;:.\s]+$/, "");
  return `${base}…`;
}

// The sticky "on this page" bar. It publishes its own height as
// --section-nav-h on <html> so sticky rails and anchored sections can sit
// below the site header AND this bar together.
//   contextLabel: the current page's subject (e.g. the industry name), shown
//   beside the section links so it stays visible while scrolling.
export function SectionNav({ sections = [], title, label, activeId, contextLabel }) {
  const listRef = useRef(null);
  const barRef = useRef(null);

  // Keep the active link visible in the horizontally scrolling list (mobile).
  useEffect(() => {
    const list = listRef.current;
    if (!list || !activeId) return;
    const el = list.querySelector('[aria-current="true"]');
    if (!el) return;
    const target = el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2;
    list.scrollTo({ left: target, behavior: "smooth" });
  }, [activeId]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const root = document.documentElement;
    const publish = () => root.style.setProperty("--section-nav-h", `${Math.round(bar.getBoundingClientRect().height)}px`);
    publish();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(publish);
    observer?.observe(bar);
    window.addEventListener("resize", publish);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", publish);
      root.style.setProperty("--section-nav-h", "0px");
    };
  }, [sections.length, contextLabel]);

  if (!sections.length) return null;

  return (
    <nav
      ref={barRef}
      aria-label={label || title}
      data-section-nav
      className="sticky top-[var(--site-header-h,var(--header-height,80px))] z-20 w-full border-y border-border bg-background/95 shadow-[0_1px_0_0_var(--border)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {contextLabel && (
          <p
            className="m-0 max-w-[12rem] shrink-0 truncate border-r border-border pr-3 text-[13px] font-semibold leading-none text-[#09263e] sm:max-w-[16rem] sm:text-sm"
            title={contextLabel}
          >
            {contextLabel}
          </p>
        )}

        <div className="relative min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-background to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-background to-transparent"
          />

          <div
            ref={listRef}
            className="flex min-w-0 items-center gap-1 overflow-x-auto scroll-smooth px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sections.map((section) => {
              const isActive = activeId === section.id;
              const short = shortNavLabel(section.title);

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-current={isActive ? "true" : undefined}
                  title={short === section.title ? undefined : section.title}
                  className={`group relative flex shrink-0 items-center rounded-md px-3.5 py-3.5 text-sm font-semibold leading-none whitespace-nowrap no-underline transition-colors duration-200 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring max-[700px]:px-3 max-[700px]:py-3 max-[700px]:text-[12px] ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {short}

                  {/* Active = primary background + accent underline */}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-3 right-3 h-[3px] origin-center rounded-t-full transition-transform duration-200 ${
                      isActive ? "scale-x-100 bg-accent" : "scale-x-0 bg-primary group-hover:scale-x-100"
                    }`}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
