import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { asText } from "@/lib/content/site-page-adapters";
import { CTA_BUTTON } from "./masthead";
import { BlockShell, Plain } from "./shared";

// The rounded navy closing panel, on a white section so it reads as separate
// from the footer. Its button opens the same contextual enquiry drawer
// (enquiry, or the contact form when the editor chose "contact").
export function CtaPanelBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const text = asText(data.text);
  const label = asText(data.button_label);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const kind = data.preset_kind === "contact" ? "contact" : "enquiry";
  return (
    <BlockShell section={section} ctx={{ ...ctx, tone: "plain" }} labelledBy={titleId} ariaLabel={section.label}>
      <div className="grid items-center gap-6 rounded-[2rem] bg-[#09263e] px-6 py-10 text-white sm:px-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:py-12">
        <div className="min-w-0">
          {heading && (
            <h2
              id={titleId}
              className="!m-0 !text-[clamp(24px,2.8vw,34px)] !font-semibold !leading-[1.2] !tracking-[-0.02em] !text-white"
            >
              {heading}
            </h2>
          )}
          <Plain className={`max-w-[60ch] !text-base !text-white/85 ${heading ? "mt-3" : ""}`}>{text}</Plain>
        </div>
        {label && (
          <EnquiryTrigger className={`${CTA_BUTTON} w-full md:w-auto`} kind={kind} source="cta-panel" pageTitle={ctx.page.h1}>
            {label}
            <span aria-hidden="true">↗</span>
          </EnquiryTrigger>
        )}
      </div>
    </BlockShell>
  );
}

export const ctaPanelEmpty = (data) => !asText(data.heading) && !asText(data.text);
