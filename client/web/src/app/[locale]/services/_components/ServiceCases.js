import { Carousel } from "@/components/home/carousel";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { b2bText } from "@/lib/pages/b2b-text";
import { homeText } from "@/lib/pages/home-copy";
import { Html } from "@/components/common/html";
import { ActionHtml } from "./ActionHtml";
import { SectionHeading } from "./SectionHeading";

export const OUR_WORK_ID = "our-work";

// "Our work": the case studies that belong to this service, as the shared case
// card, in a row that scrolls sideways inside the article column. Rendered only
// when there are cases (see casesForService in service-model.js).
// `section` is the record's own "cases" section (heading, lead-in and closing link); without one
// the default wording is used.
export function ServiceCases({ cases, section, service, t, has, locale }) {
  const tx = b2bText(t);
  if (!cases.length) return null;
  return (
    <section id={OUR_WORK_ID} className="b2b-sec" aria-labelledby={`${OUR_WORK_ID}-title`} data-component="ServiceCases">
      <SectionHeading
        id={`${OUR_WORK_ID}-title`}
        eyebrow={section?.eyebrow || section?.nav_label || tx("cases.nav", "Our work")}
        title={section?.title || tx("cases.title", "Cases we have handled for businesses like yours.")}
      />
      <Html html={section?.intro_html} className="b2b-prose" />
      <Carousel
        label={tx("cases.region", "Case studies")}
        previous={tx("cases.prev", "Previous cases")}
        next={tx("cases.next", "Next cases")}
        className="mt-6"
        itemClassName="lg:basis-[calc((100%-1.25rem)/2)]"
      >
        {cases.map((item) => (
          <CaseCard
            key={item.id}
            item={item}
            label={tx("cases.label", "Case study")}
            cta={tx("cases.cta", "See how Rapid helped")}
            labels={caseCardLabels(homeText(t, has, locale))}
          />
        ))}
      </Carousel>
      <ActionHtml html={section?.outro_html} service={service} source="service-our-work" />
    </section>
  );
}
