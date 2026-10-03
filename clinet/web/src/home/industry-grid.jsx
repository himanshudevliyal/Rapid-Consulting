"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Industry background images */
const INDUSTRY_BG = {
  I01: "/assets/download.jpg",
  I02: "/assets/hero-section.jpg",
  I03: "/assets/download.jpg",
  I04: "/assets/download.jpg",
};

/* Industry labels */
const INDUSTRY_LABEL = {
  I01: "Food & Agro",
  I02: "Manufacturing",
  I03: "Recycling",
  I04: "Logistics",
};

export function IndustryGrid({ pages, ctaLabel = "Learn more" }) {
  const [activeId, setActiveId] = useState(pages?.[0]?.id);

  if (!pages?.length) return null;

  return (
    <div
      data-component="IndustryGrid"
      className="
        relative isolate overflow-hidden
        bg-[#09263e]
        flex flex-col lg:flex-row
        h-[620px] lg:h-[460px]
        rounded-none
      "
    >
      {/* Background images */}
      {pages.map((page) => {
        const src = INDUSTRY_BG[page.id];

        if (!src) return null;

        const isActive = page.id === activeId;

        return (
          <Image
            key={page.id}
            src={src}
            alt=""
            aria-hidden="true"
            fill
            priority={page.id === pages[0]?.id}
            sizes="(min-width: 1024px) 1200px, 100vw"
            className={[
              "object-cover -z-10",
              "transition-[opacity,transform] duration-700 ease-out",
              "motion-reduce:transition-none",
              isActive
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105",
            ].join(" ")}
          />
        );
      })}

      {/* Dark readability overlay */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 -z-[5]
          bg-gradient-to-t
          from-[#09263e]/95
          via-[#09263e]/55
          to-[#09263e]/10
        "
      />

      {/* Industry Cards */}
      {pages.map((page, i) => {
        const isActive = page.id === activeId;
        const label = INDUSTRY_LABEL[page.id] || page.type;

        return (
          <Link
            key={page.id}
            href={page.href}
            data-industry-id={page.id}
            aria-current={isActive ? "true" : undefined}
            onMouseEnter={() => setActiveId(page.id)}
            onFocus={() => setActiveId(page.id)}
            className={[
              // IMPORTANT: same height for every card
              "relative flex h-full min-h-0 flex-1 flex-col",
              "justify-between p-6 lg:p-8",

              // Smooth width animation only
              "transition-[flex-grow,background-color] duration-500 ease-out",
              "motion-reduce:transition-none",

              // Hover / focus
              "outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-inset",
              "focus-visible:ring-[#c8f135]",

              // Borders
              i > 0
                ? "border-t border-white/15 lg:border-t-0 lg:border-l"
                : "",

              // Active panel expands WIDTH, not height
              isActive
                ? "lg:flex-[2.4] bg-white/[0.08]"
                : "lg:flex-1 hover:bg-white/[0.04]",
            ].join(" ")}
          >
            {/* Top content */}
            <div>
              <span
                className="
                  inline-flex
                  rounded-full
                  bg-[#c8f135]
                  px-3 py-1.5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wide
                  leading-none
                  text-[#09263e]
                "
              >
                {label}
              </span>
            </div>

            {/* Bottom content */}
            <div className="mt-auto">
              <div className="max-w-[520px]">
                <strong
                  className="
                    block
                    text-xl
                    font-bold
                    leading-tight
                    text-white
                    lg:text-2xl
                    xl:text-3xl
                  "
                >
                  {page.title}
                </strong>

                {/* Description */}
                <span
                  className={[
                    "mt-3 block",
                    "max-w-[48ch]",
                    "text-sm leading-relaxed text-white/75",
                    "line-clamp-3",
                    "transition-all duration-500",
                    "motion-reduce:transition-none",

                    isActive
                      ? "lg:max-h-24 lg:opacity-100"
                      : "lg:max-h-0 lg:opacity-0 lg:overflow-hidden",
                  ].join(" ")}
                >
                  {page.description}
                </span>

                {/* CTA */}
                <span
                  className={[
                    "mt-5 inline-flex items-center gap-2",
                    "rounded-full border",
                    "px-4 py-2.5",
                    "text-xs font-semibold",
                    "transition-all duration-300",

                    isActive
                      ? "border-[#c8f135] bg-[#c8f135] text-[#09263e]"
                      : "border-white/30 text-white group-hover:border-white/60",
                  ].join(" ")}
                >
                  <span>{ctaLabel}</span>

                  <span
                    aria-hidden="true"
                    className="
                      text-base
                      leading-none
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                    "
                  >
                    ↗
                  </span>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}