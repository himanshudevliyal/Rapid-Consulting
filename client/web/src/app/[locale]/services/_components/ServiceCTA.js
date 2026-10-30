import { ArrowRight } from "lucide-react";

import { Html } from "@/components/common/html";
import { WhatsAppMark } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER } from "@/lib/site";
import { LIME_BUTTON, OUTLINE_BUTTON } from "@/components/pages/b2b-buttons";

// "cta" role section: its text plus the same contact actions
// ("Discuss your project" opens the enquiry drawer).
export function ServiceCTA({ section, t, service }) {
  return (
    <div className="b2b-cta" data-component="ServiceCTA">
      <Html html={section.html} className="b2b-prose" />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <EnquiryTrigger className={LIME_BUTTON} source="service-cta" serviceName={service?.h1 || service?.title}>
          {t("service.discussProject")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </EnquiryTrigger>
        <a className={OUTLINE_BUTTON} href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${WHATSAPP_LABEL}`}>
          <span className="size-4 [&>svg]:size-4" aria-hidden="true">
            <WhatsAppMark />
          </span>
          WhatsApp {WHATSAPP_LABEL}
        </a>
      </div>
    </div>
  );
}
