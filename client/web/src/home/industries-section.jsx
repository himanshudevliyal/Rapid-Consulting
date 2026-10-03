import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { IndustryGrid } from "./industry-grid";
import { INDUSTRY_IDS } from "./utils";

export function IndustriesSection({ section, page, t, eyebrow, records }) {
  const industryPages = INDUSTRY_IDS.map((id) => records.find((p) => p.id === id)).filter(Boolean);

  return (
    <Section
      id="industries"
      className="overflow-x-clip bg-[#f6f6f6]"
      containerClassName=""
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Heading
          className=""
          eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
          heading={section.title}
          headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl lg:text-[2.75rem]"
        />
      </div>

      <div className="mt-10">
        <IndustryGrid pages={industryPages} fullBleed={false} />
      </div>
    </Section>
  );
}
