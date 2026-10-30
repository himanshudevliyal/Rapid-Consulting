import { ArrowUpRight } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, WRAP } from "@/components/home/styles";
import { loadIndustries } from "@/lib/content/site-data";
import { IndustryShowcase } from "./industry-showcase";

// Four industries are shown on the home page; the rest are on the industries page.
const HOME_INDUSTRIES = 4;

// The industries come from the API (admin panel -> Industries): add one and it
// appears here with its image.
export async function IndustriesSection({ text, title, locale, viewAllHref }) {
  const industries = (await loadIndustries()).slice(0, HOME_INDUSTRIES);
  if (!industries.length) return null;

  return (
    <section id="industries" aria-labelledby="home-industries-title" className="scroll-mt-24 bg-[#f1f5f2] py-12 sm:py-16 lg:py-20">
      <div className={WRAP}>
        <SectionHeading id="home-industries-title" eyebrow={text("homeA.industries.eyebrow")} title={title} />

        <div className="mt-8">
          <IndustryShowcase
            industries={industries}
            exploreLabel={text("homeA.industries.explore")}
            showLabel={text("homeA.industries.show")}
            placeholderLabel={text("homeA.industries.image", { industry: "{industry}" })}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <a href={viewAllHref || `/${locale}/industries`} className={BTN_LIME}>
            {text("homeA.industries.viewAll")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
