import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { Html } from "@/components/pages/content-primitives";

export function DefaultSection({ section, eyebrow }) {
  return (
    <Section id={section.id} className="bg-gray-50 py-16 lg:py-24">
      <Heading
        className="mx-auto max-w-3xl text-center"
        eyebrow={eyebrow}
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
        heading={section.title}
        headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
      />
      <Html
        html={section.html}
        className="mx-auto mt-8 max-w-3xl text-base leading-8 text-slate-600 [&_p]:m-0 [&_p+p]:mt-4"
      />
    </Section>
  );
}
