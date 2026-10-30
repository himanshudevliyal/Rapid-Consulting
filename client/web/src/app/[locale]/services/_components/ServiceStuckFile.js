import { ArrowRight } from "lucide-react";

import { Html } from "@/components/common/html";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { b2bText } from "@/lib/pages/b2b-text";
import { LIME_BUTTON } from "@/components/pages/b2b-buttons";
import { ActionHtml, splitActions } from "./ActionHtml";

// "Stuck file?": a navy panel for someone whose application is already filed
// and not moving. The text is the section's own; the button opens the enquiry
// drawer with this service as its subject.
export function ServiceStuckFile({ section, service, t, titleId, eyebrow }) {
  const tx = b2bText(t);
  const name = service?.h1 || service?.title;
  const items = (section.items ?? []).filter((item) => item.title);
  return (
    <div className="b2b-stuck" data-component="ServiceStuckFile">
      {eyebrow && <p className="b2b-eyebrow b2b-eyebrow--on-navy">{eyebrow}</p>}
      <h2 id={titleId} className="b2b-h2 b2b-h2--on-navy">
        {section.title}
      </h2>
      {/* The text, then (when both are written) the lead-in to the list ("Send us"). */}
      <Html html={section.html || section.intro_html} className="b2b-prose b2b-prose--on-navy" />
      {section.html && section.intro_html && <Html html={section.intro_html} className="b2b-prose b2b-prose--on-navy mt-4" />}
      {items.length > 0 && (
        <ul className="b2b-stuck__list">
          {items.map((item, index) => (
            <li key={item.key || index}>
              <strong>{item.title}</strong>
              <Html html={item.html} className="b2b-prose b2b-prose--on-navy" />
            </li>
          ))}
        </ul>
      )}
      {/* A link-only paragraph in the closing text is the button (its words are the record's). */}
      <ActionHtml html={section.outro_html} service={service} source="service-stuck-file" className="b2b-prose b2b-prose--on-navy mt-4" />
      {!splitActions(section.outro_html).some((part) => part.type === "action") && (
        <EnquiryTrigger className={`${LIME_BUTTON} mt-6`} source="service-stuck-file" serviceName={name}>
          {section.cta_label || tx("stuck.cta", "Get my file reviewed")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </EnquiryTrigger>
      )}
    </div>
  );
}
