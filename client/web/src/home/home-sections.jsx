
import { getPage, getSummaries } from "@/lib/pages/content";
import { homeSectionRole } from "@/lib/pages/presentation";
import { ApproachSection } from "./approach-section";
import { ServicesSection } from "./services-section-server";
 import { IndustriesSection } from "./industries-section";
import { PlanningSection } from "./planning-section";
import { ProofSection } from "./proof-section";
import { ResourcesSection } from "./resources-section";
import { ContactSection } from "./contact-section";
import { DefaultSection } from "./default-section";
import { paragraphs } from "./utils";

export function HomeSections({ page, t, has }) {
  const hi = page.locale === "hi";
  const records = getSummaries(page.locale);

  return (
    <div className="home-sections">
      {page.sections.map((section) => {
        const kind = homeSectionRole(section);
        const eyebrow = kind ? t(`site.homeLabels.${kind}`) : undefined;
        const shared = { section, page, t, has, eyebrow, records };

        switch (kind) {
          case "approach": {
            const alternateLocale = hi ? "en" : "hi";
            const alternate = getPage(page.id, alternateLocale)?.sections.find(
              (s) => homeSectionRole(s) === "approach",
            );
            const contactSection = page.sections.find((s) => homeSectionRole(s) === "contact");
            return (
              <ApproachSection
                key={section.id}
                id={section.id}
                eyebrow={eyebrow}
                title={section.title}
                paragraphs={paragraphs(section.html)}
                alternate={alternate?.title}
                alternateLocale={alternateLocale}
                ctaHref={contactSection ? `#${contactSection.id}` : "#contact"}
                ctaLabel={hi ? "मुफ़्त परामर्श लें" : "Talk to us"}
              />
            );
          }
           case "industries":
            return <IndustriesSection key={section.id} {...shared} />;
          case "services":
            return <ServicesSection key={section.id} {...shared} />;
          case "planning":
            return <PlanningSection key={section.id} {...shared} />;
          case "proof":
            return <ProofSection key={section.id} {...shared} />;
          case "resources":
            return <ResourcesSection key={section.id} {...shared} />;
          case "contact":
            return <ContactSection key={section.id} {...shared} />;
          default:
            return <DefaultSection key={section.id} {...shared} />;
        }
      })}
    </div>
  );
}