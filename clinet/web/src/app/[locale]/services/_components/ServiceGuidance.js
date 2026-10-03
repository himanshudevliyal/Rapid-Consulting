"use client";

import { Html } from "@/components/common/html";
import Section from "@/components/layout/section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Supporting guidance under the services directory, as disclosures.
export function ServiceGuidance({ sections }) {
  if (!sections?.length) return null;
  return (
    <Section>
    <Accordion type="multiple" className="collection-guidance">
      {sections.map((section) => (
        <AccordionItem key={section.key} value={section.key} id={section.key} className="guidance-item border-b-0">
          <AccordionTrigger className="guidance-trigger">{section.title}</AccordionTrigger>
          <AccordionContent forceMount>
            <Html html={section.html} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
    </Section>
  );
}
