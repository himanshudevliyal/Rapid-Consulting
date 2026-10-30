"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Carousel } from "@/components/home/carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, WRAP } from "@/components/home/styles";
import { Icon } from "@/components/common/icon";
import { TabList, panelId, tabId } from "@/components/common/tab-list";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";

/** @typedef {{ id: string, title: string, href: string, hint?: string, icon?: string, locale: string }} Card */
/** @typedef {{ id: string, label: string, title: string, blurb: string, cta: string, source: string, cards: Card[], note?: string }} Family */

/** One service / scheme card: icon, arrow, title and a short hint, on a light blue-grey tile. */
export function ServiceCard({ card, locale, englishSuffix }) {
  return (
    <a
      href={card.href}
      className="group flex h-full min-h-[150px] flex-col rounded-xl border border-[#d5dee6] bg-[#e9eef2] p-4 text-[#09263e]! no-underline transition-colors duration-200 hover:border-[#09263e]/30 hover:bg-[#dfe7ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
    >
      <span className="flex items-start justify-between gap-3">
        <Icon name={card.icon || "file-text"} className="[&_img]:size-5" />
        <ArrowUpRight
          className="size-5 shrink-0 text-[#09263e] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
      <span className="mt-4 block text-[15px] font-semibold leading-snug text-[#09263e]">
        {card.title}
        {locale === "hi" && card.locale === "en" ? englishSuffix : ""}
      </span>
      {card.hint && <span className="mt-auto block pt-4 text-[13px] leading-5 text-slate-600">{card.hint}</span>}
    </a>
  );
}

export function ServicesTabUI({
  sectionId,
  eyebrow,
  title,
  intro,
  locale,
  englishSuffix,
  tabsLabel,
  families,
  carouselLabel,
  previous,
  next,
  alsoText,
  viewAllLabel,
  viewAllHref,
  emptyText,
}) {
  const [activeId, setActiveId] = useState(families[0]?.id ?? null);
  const active = families.find((family) => family.id === activeId) ?? families[0];
  const prefix = `${sectionId || "services"}-tabs`;

  return (
    <section id={sectionId} aria-labelledby={`${prefix}-title`} className="scroll-mt-24 bg-[#f0eee9] py-12 sm:py-16 lg:py-20">
      <div className={WRAP}>
        <SectionHeading id={`${prefix}-title`} eyebrow={eyebrow} title={title} intro={intro} />

        {/* Folder tabs on top of the panel: slanted (trapezoid) tabs that overlap a little, the
            selected one navy and in front. Real tab list (arrow keys, Home / End); switching
            only swaps the panel, the page does not move. */}
        <TabList
          tabs={families.map(({ id, label }) => ({ id, label }))}
          value={active?.id ?? ""}
          onChange={setActiveId}
          label={tabsLabel}
          idPrefix={prefix}
          className="mt-8 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*:nth-child(1)]:z-[4] [&>*:nth-child(2)]:z-[3] [&>*:nth-child(3)]:z-[2] [&>*:nth-child(4)]:z-[1]"
          tabClassName="relative -mr-4 min-h-12 min-w-[10.5rem] flex-1 basis-0 justify-center rounded-none border-0 py-3 pl-4 pr-7 text-center text-sm leading-snug whitespace-normal [clip-path:polygon(0_100%,0_12px,12px_0,calc(100%-26px)_0,100%_100%)] last:mr-0 sm:min-h-[52px] sm:min-w-[11rem] sm:pl-5 sm:pr-8 sm:text-base"
          selectedClassName="z-10! bg-[#09263e] text-white"
          idleClassName="bg-[#f3f5f7] text-[#09263e] even:bg-[#e9edf1] hover:bg-white"
        />

        {active && (
          <div
            role="tabpanel"
            id={panelId(prefix)}
            aria-labelledby={tabId(prefix, active.id)}
            className="relative rounded-b-2xl border border-slate-200 bg-white p-5 sm:rounded-tr-2xl sm:p-7"
          >
            {active.cards.length > 0 ? (
              <Carousel
                key={active.id}
                label={carouselLabel}
                previous={previous}
                next={next}
                showCounter={false}
                controlClassName="size-9 rounded-lg border-slate-300 bg-white hover:bg-[#f1f5f9] disabled:border-slate-200 disabled:bg-[#eef1f4] disabled:text-slate-400 disabled:hover:bg-[#eef1f4]"
                itemClassName="basis-[78%] sm:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-4rem)/5)]"
                trackClassName="gap-4"
                lead={
                  <div className="max-w-4xl">
                    <h3 className="m-0! text-lg! font-semibold! leading-snug! tracking-tight! text-[#09263e]! sm:text-xl!">
                      {active.title}
                    </h3>
                    <p className="mb-0! mt-2! text-sm leading-6 text-slate-600">{active.blurb}</p>
                  </div>
                }
              >
                {active.cards.map((card) => (
                  <ServiceCard key={card.id} card={card} locale={locale} englishSuffix={englishSuffix} />
                ))}
              </Carousel>
            ) : (
              <div>
                <h3 className="m-0! text-xl! font-semibold! text-[#09263e]!">{active.title}</h3>
                <p className="mb-0! mt-2! text-[15px] text-slate-700">{emptyText}</p>
              </div>
            )}

            {active.note && <p className="mb-0! mt-4! max-w-3xl text-sm leading-6 text-slate-700">{active.note}</p>}

            <div className="mt-6">
              <EnquiryTrigger source={active.source} serviceName={active.cta} className={BTN_LIME}>
                {active.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </EnquiryTrigger>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0! text-base font-semibold text-[#09263e]">{alsoText}</p>
          <a href={viewAllHref} className={BTN_LIME}>
            {viewAllLabel}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
