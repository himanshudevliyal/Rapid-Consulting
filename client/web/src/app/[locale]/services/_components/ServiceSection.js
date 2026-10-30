import { ServiceBenefits } from "./ServiceBenefits";
import { ServiceCards } from "./ServiceCards";
import { ServiceCTA } from "./ServiceCTA";
import { ServiceEligibility } from "./ServiceEligibility";
import { ServiceFAQ } from "./ServiceFAQ";
import { ServiceFeatures } from "./ServiceFeatures";
import { ServiceOverview } from "./ServiceOverview";
import { ServiceProcess } from "./ServiceProcess";
import { ServiceReviews } from "./ServiceReviews";
import { ServiceQuickAnswers } from "./ServiceQuickAnswers";
import { ServiceInfoCards } from "./ServiceInfoCards";
import { ServicePanel } from "./ServicePanel";
import { ServiceStuckFile } from "./ServiceStuckFile";
import { SectionHeading } from "./SectionHeading";

const ServicePanelNavy = (props) => <ServicePanel {...props} tone="navy" />;
const ServicePanelGrey = (props) => <ServicePanel {...props} tone="grey" />;

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
  quick_answers: ServiceQuickAnswers,
  eligibility: ServiceEligibility,
  stuck_file: ServiceStuckFile,
  panel_navy: ServicePanelNavy,
  panel_grey: ServicePanelGrey,
  cards: ServiceInfoCards,
  reviews: ServiceReviews,
};

// These draw their own card, heading included.
const OWN_HEADING = new Set(["quick_answers", "stuck_file", "panel_navy", "panel_grey"]);
// These place the heading themselves (FAQs: heading + short paragraph beside the questions).
const HEADING_INSIDE = new Set(["faq"]);

export function ServiceSection({ section, index, service, servicesByCode, locale, t }) {
  const Renderer = RENDERERS[section.role] ?? ServiceOverview;
  const own = OWN_HEADING.has(section.role);
  const label = (section.nav_label ?? "").trim();
  // "OVERVIEW" above "What is CLU permission?"; the number when the two say the same.
  // An eyebrow written on the section wins; the "cards" and "reviews" roles have no number.
  const written = (section.eyebrow ?? "").trim();
  const numbered = section.role === "cards" || section.role === "reviews" ? "" : String(index + 1).padStart(2, "0");
  const eyebrow = written || (label && label.toLowerCase() !== (section.title ?? "").trim().toLowerCase() ? label : numbered);
  const titleId = `${section.key}-title`;
  const classes = ["b2b-sec", own ? "b2b-sec--card" : "", service.code === "D077" ? "zed-section" : ""];

  return (
    <section
      id={section.key}
      className={classes.filter(Boolean).join(" ")}
      data-role={section.role}
      aria-labelledby={section.title ? titleId : undefined}
    >
      {!own && !HEADING_INSIDE.has(section.role) && section.title && <SectionHeading id={titleId} eyebrow={eyebrow} title={section.title} />}
      {Renderer === ServiceFAQ ? (
        // Client component: receives serialisable data only.
        <ServiceFAQ section={section} eyebrow={eyebrow} titleId={titleId} />
      ) : (
        <Renderer section={section} service={service} servicesByCode={servicesByCode} locale={locale} t={t} titleId={titleId} eyebrow={eyebrow} />
      )}
    </section>
  );
}
