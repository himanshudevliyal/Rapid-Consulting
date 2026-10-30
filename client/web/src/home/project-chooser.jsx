"use client";

import { useState } from "react";
import { ArrowRight, TriangleAlert } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, WRAP } from "@/components/home/styles";
import { TabList, panelId, tabId } from "@/components/common/tab-list";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";

/**
 * "Your project": a situation chooser. The left list (a vertical tab list: arrow
 * keys, Home / End) selects a situation; the right panel shows its questions,
 * how Rapid helps, a caution and the call to action. Switching happens in place:
 * nothing navigates and the page does not move. The CTA opens the enquiry
 * drawer with that situation as its source.
 */
export function ProjectChooser({ eyebrow, title, intro, listLabel, questionsLabel, helpsLabel, situations }) {
  const [activeId, setActiveId] = useState(situations[0]?.id);
  const active = situations.find((item) => item.id === activeId) ?? situations[0];
  const prefix = "home-project";
  if (!active) return null;

  return (
    <section id="your-project" aria-labelledby={`${prefix}-title`} className="scroll-mt-24 bg-[#eaf0ec] py-12 sm:py-16 lg:py-20">
      <div className={WRAP}>
        <SectionHeading id={`${prefix}-title`} eyebrow={eyebrow} title={title} intro={intro} />

        <div className="mt-8 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
          <div className="border-b border-slate-200 bg-[#f6f8f6] p-3 sm:p-4 lg:border-b-0 lg:border-r">
            <TabList
              tabs={situations.map(({ id, label }) => ({ id, label }))}
              value={active.id}
              onChange={setActiveId}
              label={listLabel}
              idPrefix={prefix}
              className="flex flex-col gap-2"
              tabClassName="w-full justify-start whitespace-normal rounded-xl border-0 px-4 py-3 text-left text-[15px]"
              selectedClassName="bg-[#09263e] text-white"
              idleClassName="bg-transparent text-[#09263e] hover:bg-white"
            />
          </div>

          <div
            role="tabpanel"
            id={panelId(prefix)}
            aria-labelledby={tabId(prefix, active.id)}
            tabIndex={0}
            className="p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#09263e] sm:p-8"
          >
            <h3 className="m-0! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]! sm:text-2xl!">{active.title}</h3>

            <p className="mb-0! mt-5! text-xs font-bold uppercase tracking-[0.14em] text-slate-700">{questionsLabel}</p>
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
              {active.questions.map((question) => (
                <li
                  key={question}
                  className="m-0 rounded-full border border-[#09263e]/15 bg-[#eef3f1] px-4 py-2 text-sm leading-5 text-[#09263e]"
                >
                  {question}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-[#f6f8f6] p-5">
              <p className="m-0! text-sm font-bold text-[#1f5d57]">{helpsLabel}</p>
              <p className="mb-0! mt-2! text-[15px] leading-7 text-slate-800">{active.helps}</p>
            </div>

            <p className="mb-0! mt-4! flex items-start gap-3 rounded-2xl border border-[#f1c4cf] bg-[#fdebf0] p-4 text-sm font-medium leading-6 text-[#7a1f3a]">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span>{active.warning}</span>
            </p>

            <div className="mt-6">
              <EnquiryTrigger source={`home-project-${active.id}`.toLowerCase()} serviceName={active.label} className={BTN_LIME}>
                {active.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </EnquiryTrigger>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProjectChooser;
