import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { ProjectStages } from "./project-stages";

export function PlanningSection({ section, eyebrow }) {
  return (
    <Section id={section.id} className="overflow-x-clip bg-[#edf1f3] py-16 lg:py-24">
      <Heading
        className="mx-auto max-w-3xl text-center"
        eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]"
        heading={section.title}
        headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl lg:text-[2.75rem]"
      />
      <div className="mt-12 lg:mt-8">
        <ProjectStages html={section.html} />
      </div>
    </Section>
  );
}
