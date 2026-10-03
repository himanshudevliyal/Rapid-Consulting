"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Answers stay in the HTML (forceMount) so they are readable without JavaScript
// and by search engines.
export function FaqAccordion({ items }) {
  return (
    <Accordion type="multiple">
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} id={item.id || undefined} className="faq-item border-b-0">
          <AccordionTrigger className="faq-trigger">
            <span dangerouslySetInnerHTML={{ __html: item.questionHtml }} />
          </AccordionTrigger>
          <AccordionContent forceMount className="faq-answer">
            <div className="prose" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
