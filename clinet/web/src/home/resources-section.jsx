import { ArrowRight } from "lucide-react";

import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { pageHref } from "@/lib/pages/content";
import { paragraphs, renderCard } from "./utils";

export function ResourcesSection({ section, page, t, has, eyebrow, records }) {
  const parts = paragraphs(section.html);

  return (
    <Section id={section.id}   className="bg-gray-50 ">
      {/* Heading: left + "view all" link right, bottom border */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <Heading
          className="max-w-2xl text-left"
          eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
          heading={section.title}
          headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
        />
        <a
          href={pageHref("R01", page.locale)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f5d57] transition-colors hover:text-[#09263e]"
        >
          {t("common.viewAll")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {parts.map((html) => renderCard({ html, records, page, t, has }))}
      </div> 
    </Section>
  );
}
