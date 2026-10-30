"use client";

import { Minus, Plus } from "lucide-react";

import { Html } from "@/components/common/html";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ActionHtml } from "./ActionHtml";
import { SectionHeading } from "./SectionHeading";

// FAQs in two columns: on the left the heading and the service's own short
// paragraph (the section's Intro text in the admin panel), on the right the
// questions as rounded cards in an accessible accordion (shadcn/Radix). The
// open card is tinted; "+" opens, "−" closes. The first question starts open,
// and answers stay in the DOM for search engines.
const ICON = (
  <>
    <Plus className="size-4 group-data-[state=open]:hidden" strokeWidth={1.75} />
    <Minus className="hidden size-4 group-data-[state=open]:block" strokeWidth={1.75} />
  </>
);

export function ServiceFAQ({ section, eyebrow, titleId }) {
  const values = section.items.map((item, index) => item.key || `question-${index}`);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14" data-component="ServiceFAQ">
      <div>
        {section.title && <SectionHeading id={titleId} eyebrow={eyebrow} title={section.title} />}
        <Html html={section.intro_html} className="b2b-prose mt-3 !text-[15px] text-slate-600" />
      </div>
      <div>
        <Accordion type="multiple" defaultValue={values.slice(0, 1)} className="grid gap-2.5">
          {section.items.map((item, index) => {
            const value = values[index];
            return (
              <AccordionItem
                key={value}
                value={value}
                id={item.key || undefined}
                className="rounded-xl border border-slate-200 !border-b bg-white transition-colors data-[state=open]:bg-[#eef2f5] [&_h3]:!m-0 [&_h3]:!text-[15px] [&_h3]:!font-medium [&_h3]:!leading-snug"
              >
                <AccordionTrigger
                  icon={ICON}
                  className="group w-full items-center rounded-xl px-5 py-4 !text-[15px] !font-medium !leading-snug text-[#09263e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09263e] [&>.accordion-icon]:!rotate-0 [&>.accordion-icon]:text-[#09263e]"
                >
                  {item.title}
                </AccordionTrigger>
                <AccordionContent forceMount className={item.html?.trim() ? "px-5 pb-4" : ""}>
                  <Html html={item.html} className="b2b-prose !text-sm !leading-6 text-slate-600" />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        {/* "View all FAQs": a link-only paragraph becomes the lime button, on the right. */}
        <div className="flex flex-col items-end text-right">
          <ActionHtml html={section.outro_html} source="service-faq" arrow="up" />
        </div>
      </div>
    </div>
  );
}
