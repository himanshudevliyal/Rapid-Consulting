import { ArrowRight, BadgeCheck, UserCheck, Users } from "lucide-react";

import { Html } from "@/components/common/html";
import { ShareActions } from "@/components/common/share-actions";
import { WhatsAppMark } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { LIME_BUTTON, OUTLINE_BUTTON } from "@/components/pages/b2b-buttons";
import { b2bText } from "@/lib/pages/b2b-text";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER, mainSiteHref } from "@/lib/site";
import { eyebrowOf, heroPointsOf } from "./service-model";
import { ServiceVideo } from "./ServiceVideo";

const VIDEO_TYPES = ["service", "service-family", "additional-service"];
const ROW_ICONS = [Users, BadgeCheck, UserCheck];


// The "content hero" of a service page: eyebrow, the service name as the page's
// only H1, the introduction written on the service (its first line is the
// bold message), up to three icon rows taken from the record, the two actions
// and the "watch instead of reading" video card. The enquiry form is the
// sticky rail beside the page, not part of the hero.
export function ServiceHero({ service, locale, t, has }) {
  const tx = b2bText(t);
  // A "hero_benefit" section replaces the intro (Subsidies & Incentives).
  const benefit = service.sections.find((section) => section.role === "hero_benefit");
  const intro = benefit ? benefit.html : service.intro_html;
  const schemesTranslated = has("pages.R02");
  const name = service.h1 || service.title;
  const eyebrow = eyebrowOf(service);
  const points = heroPointsOf(service);

  return (
    <header className="b2b-hero" data-component="ServiceHero">
      {eyebrow && <p className="b2b-eyebrow">{eyebrow}</p>}
      <h1 className="b2b-h1">{name}</h1>
      {benefit && <h2 className="b2b-hero__benefit">{benefit.title}</h2>}
      <Html html={intro} className="b2b-lead" />

      {points.length > 0 && (
        <ul className="b2b-points" aria-label={tx("hero.pointsLabel", "Why Rapid")}>
          {points.map((point, index) => {
            const Icon = ROW_ICONS[index % ROW_ICONS.length];
            return (
              <li key={`${point.title}-${index}`}>
                <span className="b2b-points__icon" aria-hidden="true">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <strong>{point.title}</strong>
                  {point.text && <span>{point.text}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <EnquiryTrigger className={LIME_BUTTON} source="service-hero" serviceName={name}>
          {t("service.discussProject")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </EnquiryTrigger>
        <a
          className={OUTLINE_BUTTON}
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${WHATSAPP_LABEL}`}
        >
          <span className="size-4 [&>svg]:size-4" aria-hidden="true">
            <WhatsAppMark />
          </span>
          WhatsApp {WHATSAPP_LABEL}
        </a>
      </div>

      {service.code === "S01" && (
        <a className="mt-4 inline-block text-sm font-semibold text-[#09263e] underline underline-offset-4" href={mainSiteHref("R02", locale, schemesTranslated)}>
          {t("service.findScheme")}
          {schemesTranslated ? "" : t("common.englishSuffix")} →
        </a>
      )}

      <div className="mt-5">
        <ShareActions title={name} />
      </div>

      {VIDEO_TYPES.includes(service.type) && <ServiceVideo service={service} t={t} />}
    </header>
  );
}
