import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { ProjectStages } from "@/components/pages/project-stages";

export function PlanningSection({ section, eyebrow }) {
  return (
    <Section id={section.id} className="bg-white py-16 lg:py-24">
      <Heading
        className="mx-auto mb-12 max-w-3xl text-center"
        eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
        heading={section.title}
        headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
      />

      <ProjectStages html={section.html} />
    </Section>
  );
}
