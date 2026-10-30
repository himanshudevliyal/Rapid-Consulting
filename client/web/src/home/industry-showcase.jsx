"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronRight } from "lucide-react";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { cn } from "@/lib/utils";

const isRemote = (src) => /^https?:\/\//i.test(src);

// The small caps line at the top of a card ("FOOD & AGRO"). Industries have no
// short name of their own, so it follows the industry's icon (set in the admin
// panel); an industry with another icon shows its full name.
const SHORT_LABEL = {
  leaf: "Food & Agro",
  gear: "Manufacturing",
  recycle: "Recycling & Biofuel",
  warehouse: "Commercial & Logistics",
};
const shortLabel = (industry) => SHORT_LABEL[industry.icon] || industry.title;

function Backdrop({ industry, placeholderLabel, eager }) {
  return industry.image ? (
    <Image
      src={industry.image}
      alt=""
      fill
      unoptimized={isRemote(industry.image)}
      loading={eager ? "eager" : "lazy"}
      sizes="(min-width: 1024px) 40vw, 100vw"
      className="object-cover"
    />
  ) : (
    <ImagePlaceholder
      className="absolute inset-0 rounded-none border-0"
      label={placeholderLabel.replace("{industry}", industry.title)}
    />
  );
}

/**
 * Industries: one wide expanded card (picture, name, summary and an "Explore
 * industry" link) and the others narrow, with their name and "Show details".
 * Every card carries a small label at the top and a navy tint over its photo.
 * A narrow card is a button; pressing it expands that industry in place (the
 * previous one narrows). Nothing navigates and no content is hover-only.
 * The industries come from the API; a card without a picture shows a labelled
 * placeholder.
 */
export function IndustryShowcase({ industries, exploreLabel, showLabel, placeholderLabel }) {
  const [activeId, setActiveId] = useState(industries[0]?.id);

  return (
    <ul data-component="IndustryShowcase" className="m-0 flex list-none flex-col gap-3 p-0 lg:h-[340px] lg:flex-row">
      {industries.map((industry, index) => {
        const open = industry.id === activeId;
        return (
          <li
            key={industry.id}
            className={cn(
              "relative m-0 min-w-0 overflow-hidden rounded-2xl bg-[#09263e] text-white transition-[flex-grow] duration-300 motion-reduce:transition-none",
              open ? "min-h-[300px] lg:min-h-0 lg:flex-[2.1]" : "min-h-[150px] lg:min-h-0 lg:flex-1",
            )}
          >
            <Backdrop industry={industry} placeholderLabel={placeholderLabel} eager={index < 2} />
            {/* Navy tint over the whole photo, darker at the bottom where the text sits. */}
            <div aria-hidden="true" className="absolute inset-0 bg-[#0d3a5f]/55" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#09263e]/90 via-[#09263e]/20 to-transparent" />

            <p className="absolute left-5 top-5 z-10 m-0! text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">
              {shortLabel(industry)}
            </p>

            {open ? (
              <div className="relative flex h-full min-h-[300px] flex-col justify-end p-5 sm:p-6 lg:min-h-0">
                <h3 className="m-0! max-w-[20ch]! text-xl! font-semibold! leading-tight! tracking-tight! text-white! sm:text-2xl!">
                  {industry.title}
                </h3>
                {industry.description && (
                  <p className="mb-0! mt-2! line-clamp-2 max-w-md text-sm leading-6 text-white/90">{industry.description}</p>
                )}
                <a
                  href={industry.href}
                  className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#eef3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09263e]"
                >
                  {exploreLabel}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <button
                type="button"
                aria-expanded="false"
                onClick={() => setActiveId(industry.id)}
                className="relative flex h-full min-h-[150px] w-full flex-col justify-end p-5 text-left text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white lg:min-h-0"
              >
                <span className="block text-lg font-semibold leading-snug tracking-tight">{industry.title}</span>
                <span className="mt-3 flex w-full items-center justify-between text-xs font-semibold text-white/90">
                  {showLabel}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
