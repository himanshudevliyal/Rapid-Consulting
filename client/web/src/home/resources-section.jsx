import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { ResourceBlocks } from "@/components/pages/resource-blocks";

// Guides and scheme information come from the API (admin panel -> Articles
// with type "guide", and Schemes with "Show on the home page" ticked).
export function ResourcesSection({ section, page, t, eyebrow }) {
  return (
    <Section id={section.id} className="bg-gray-50 ">
      <div className="border-b border-slate-200 pb-6">
        <Heading
          className="max-w-2xl text-left"
          eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
          heading={section.title}
          headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
        />
      </div>

      <div className="mt-10">
        <ResourceBlocks locale={page.locale} t={t} />
      </div>
    </Section>
  );
}
