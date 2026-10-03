import Heading from "@/components/layout/heading";
import { ServiceBenefits } from "./ServiceBenefits";
import { ServiceCards } from "./ServiceCards";
import { ServiceCTA } from "./ServiceCTA";
import { ServiceFAQ } from "./ServiceFAQ";
import { ServiceFeatures } from "./ServiceFeatures";
import { ServiceOverview } from "./ServiceOverview";
import { ServiceProcess } from "./ServiceProcess";

// The section's `role` (set in the admin panel / import) picks the reusable
// component. Unknown roles fall back to rich text so no content is lost.
const RENDERERS = {
  content: ServiceOverview,
  features: ServiceFeatures,
  benefits: ServiceBenefits,
  process: ServiceProcess,
  faq: ServiceFAQ,
  service_cards: ServiceCards,
  cta: ServiceCTA,
};

export function ServiceSection({ section, index, service, servicesByCode, locale, t }) {
  const Renderer = RENDERERS[section.role] ?? ServiceOverview;
  const classes = ["body-section", index % 2 ? "section-wash" : "", service.code === "D077" ? "zed-section" : ""];

  return (
    <section id={section.key} className={classes.filter(Boolean).join(" ")} data-role={section.role}>
      {/* Section heading via Heading component */}
      <Heading
        eyebrow={String(index + 1).padStart(2, "0")}
        heading={section.title}
        className="text-left mb-5"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
        headingClassName="text-[28px] leading-[1.35] font-semibold text-[#09263e] mt-1"
      />
      {Renderer === ServiceFAQ ? (
        // Client component: receives serialisable data only.
        <ServiceFAQ section={section} />
      ) : (
        <Renderer section={section} servicesByCode={servicesByCode} locale={locale} t={t} />
      )}
    </section>
  );
}
