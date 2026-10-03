"use client";

import { useEffect, useRef } from "react";

export function SectionNav({ sections = [], title, label, activeId }) {
const listRef = useRef(null);

// Active tab ko horizontal scroll ke andar visible rakho (mobile pe useful)
useEffect(() => {
const list = listRef.current;
if (!list || !activeId) return;

const el = list.querySelector('[aria-current="page"]');
if (!el) return;

const target =
  el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2;

list.scrollTo({
  left: target,
  behavior: "smooth",
});

}, [activeId]);

if (!sections.length) return null;

return (
<nav
aria-label={label || title}
className="
sticky top-[var(--header-height,80px)] z-20 w-full
border-y border-border
bg-background/95 backdrop-blur-md
shadow-[0_1px_0_0_var(--border)]
max-[700px]:top-[var(--header-height,64px)]
"
>
<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
{/* scroll fade edges */}
<span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 z-10 w-6 bg-gradient-to-r from-background to-transparent sm:left-6 lg:left-8" />

    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-4 z-10 w-6 bg-gradient-to-l from-background to-transparent sm:right-6 lg:right-8"
    />

    <div
      ref={listRef}
      className="
        flex min-w-0 items-center gap-1
        overflow-x-auto scroll-smooth
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
      "
    >
      {sections.map((section) => {
        const isActive = activeId === section.id;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={isActive ? "page" : undefined}
            className={`
              group relative flex shrink-0 items-center
              rounded-md px-3.5 py-4
              text-sm font-semibold leading-none whitespace-nowrap no-underline
              transition-colors duration-200
              focus-visible:z-10 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
              max-[700px]:px-3 max-[700px]:py-3.5 max-[700px]:text-[12px]
              ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }
            `}
          >
            {section.title}

            {/* Active = primary background + accent underline */}
            <span
              aria-hidden="true"
              className={`
                absolute bottom-0 left-3 right-3 h-[3px] origin-center
                rounded-t-full transition-transform duration-200
                ${
                  isActive
                    ? "scale-x-100 bg-accent"
                    : "scale-x-0 bg-primary group-hover:scale-x-100"
                }
              `}
            />
          </a>
        );
      })}
    </div>
  </div>
</nav>
);
}