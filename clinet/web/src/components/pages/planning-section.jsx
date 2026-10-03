import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { ProjectStages } from "./project-stages";

export function PlanningSection({ section, page, eyebrow }) {
  return (
    <Section id={section.id} className="overflow-x-clip bg-[#edf1f3] py-16 lg:py-24">
      <Heading
        className="mx-auto max-w-3xl text-center"
        eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
        heading={section.title}
        headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl lg:text-[2.75rem]"
      />
      <div className="mt-12 lg:mt-8">
        <ProjectStages html={section.html} stepLabel={page.locale === "hi" ? "चरण" : "Step"} />
      </div>
    </Section>
  );
}
