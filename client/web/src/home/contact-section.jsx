import Section from "@/components/layout/section";
import { Html } from "@/components/pages/content-primitives";
import { ContactExperience } from "@/components/form/contact-experience";

// Layout ab ContactExperience (variant="section") khud handle karta hai.
export function ContactSection({ section, page, eyebrow }) {
  return (
    <Section id={section.id} className="bg-[#fdfdf8] py-16 lg:py-24">
      <ContactExperience
        pageTitle={page.h1}
        pageId={page.id}
        variant="section"
        eyebrow={eyebrow}
        heading={section.title}
        description={<Html html={section.html} />}
      />
    </Section>
  );
}