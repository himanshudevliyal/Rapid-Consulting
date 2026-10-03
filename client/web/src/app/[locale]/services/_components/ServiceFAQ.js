"use client";

import { Html } from "@/components/common/html";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Question/answer pairs as an accessible accordion (shadcn/Radix), keeping
// the prototype's "+" disclosure styling. Answers stay in the DOM for search.
export function ServiceFAQ({ section }) {
  return (
    <div className="faq-list" data-component="ServiceFAQ">
      <Html html={section.intro_html} />
      <Accordion type="multiple">
        {section.items.map((item, index) => {
          const value = item.key || `question-${index}`;
          return (
            <AccordionItem key={value} value={value} id={item.key || undefined} className="faq-item border-b-0">
              <AccordionTrigger className="faq-trigger">{item.title}</AccordionTrigger>
              <AccordionContent forceMount className="faq-answer">
                <Html html={item.html} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <Html html={section.outro_html} />
    </div>
  );
}
