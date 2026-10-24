import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { loadIndustries } from "@/lib/content/site-data";
import { IndustryGrid } from "./industry-grid";

// The industries come from the API (admin panel -> Industries): add one and it
// appears here with its image.
export async function IndustriesSection({ section, t, eyebrow }) {
  const industries = await loadIndustries();
  if (!industries.length) return null;

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
        <IndustryGrid pages={industries} ctaLabel={t("site.card.explore")} tagLabel={t("site.types.industry")} />
      </div>
    </Section>
  );
}
