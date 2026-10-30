import { ArrowUpRight } from "lucide-react";

import { Carousel } from "@/components/home/carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, WRAP } from "@/components/home/styles";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { loadCaseStudies } from "@/lib/content/site-data";
import { text as str } from "@/lib/content/managed-text";

// A short, recent selection on the home page; the archive has the rest.
const HOME_CASES = 6;

/**
 * Client success: every published case study the API returns (newest as the API
 * orders them) in a manual carousel of the shared CaseCard. Add one in the
 * admin panel and it appears here. With no case study there is no section.
 */
export async function ProofSection({ text, ctaLabel, ctaHref, fallback = null }) {
  const cases = await loadCaseStudies({ limit: HOME_CASES });
  // No published case study yet: the managed page's own sample cards (when it has them).
  if (!cases.length) return fallback;
  const labels = caseCardLabels(text);

  return (
    <section id="client-success" aria-labelledby="home-cases-title" className="scroll-mt-24 bg-white py-12 sm:py-16 lg:py-20">
      <div className={WRAP}>
        <Carousel
          label={text("homeA.cases.carousel")}
          previous={text("homeA.cases.previous")}
          next={text("homeA.cases.next")}
          lead={
            <SectionHeading
              id="home-cases-title"
              eyebrow={text("homeA.cases.eyebrow")}
              title={text("homeA.cases.title")}
              intro={text("homeA.cases.intro")}
            />
          }
        >
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} labels={labels} label={text("homeA.cases.label")} cta={text("homeA.cases.cta")} />
          ))}
        </Carousel>
        {str(ctaLabel) && str(ctaHref) && (
          <div className="mt-8">
            <a href={ctaHref} className={BTN_LIME}>
              {ctaLabel}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
