import { Html } from "@/components/common/html";
import { ShareActions } from "@/components/common/share-actions";
import { VideoPlaceholder } from "@/components/common/video-placeholder";
import { mainSiteHref } from "@/lib/site";
import { ContextActions } from "@/components/common/context-actions";
import Heading from "@/components/layout/heading";
import { ServiceReviewNote } from "./ServiceReviewNote";

const VIDEO_TYPES = ["service", "service-family", "additional-service"];

export function ServiceHero({ service, locale, t, has }) {
  // A "hero_benefit" section replaces the intro (Subsidies & Incentives).
  const benefit = service.sections.find((section) => section.role === "hero_benefit");
  const intro = benefit ? benefit.html : service.intro_html;
  const schemesTranslated = has("pages.R02");

  return (
    <header className="page-hero detail-hero">
      {/* Eyebrow + H1 via Heading component */}
      <Heading
        eyebrow={service.eyebrow}
        heading={service.h1 || service.title}
        className="text-left"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
        headingClassName="text-[clamp(34px,3.7vw,48px)] leading-[1.16] tracking-[-0.04em] font-semibold text-[#09263e] mt-0"
      />
      <ShareActions title={service.h1 || service.title} />
      {benefit && <h2 className="benefit-heading">{benefit.title}</h2>}
      <Html html={intro} className="hero-copy" />
      <ContextActions t={t} />
      {service.code === "S01" && (
        <a className="quiet-link" href={mainSiteHref("R02", locale, schemesTranslated)}>
          {t("service.findScheme")}
          {schemesTranslated ? "" : t("common.englishSuffix")} →
        </a>
      )}
      {/* {VIDEO_TYPES.includes(service.type) && <VideoPlaceholder t={t} />} */}
      {/* <ServiceReviewNote service={service} t={t} /> */}
    </header>
  );
}
