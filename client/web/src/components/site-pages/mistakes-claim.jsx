import { Info } from "lucide-react";

import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { cn } from "@/lib/utils";
import { asArray, asText, sourceSlug } from "@/lib/content/site-page-adapters";
import { BandHead } from "./band";
import { CTA_BUTTON } from "./masthead";
import { BlockShell, Plain } from "./shared";

// A sage band with a centred heading and two white cards:
//   left   "Common mistakes": rows with an information icon
//   right  "Claim stuck?": a short text and a button that opens the enquiry
//          form (the preset is recorded with the enquiry)
// Used on the Subsidies hub ("Where subsidies get lost") and the Finance hub
// ("Where money is lost"). No promises are made in the card text; the editor
// writes it.

export function mistakesClaimModel(data) {
  return {
    eyebrow: asText(data.eyebrow),
    heading: asText(data.heading),
    mistakesTitle: asText(data.mistakes_title),
    mistakes: asArray(data.mistakes)
      .map((item) => asText(item?.text))
      .filter(Boolean),
    claimTitle: asText(data.claim_title),
    claimText: asText(data.claim_text),
    claimLabel: asText(data.claim_cta_label),
    claimPreset: asText(data.claim_cta_preset),
  };
}

export const mistakesClaimEmpty = (data) => {
  const model = mistakesClaimModel(data);
  return !model.heading && model.mistakes.length === 0 && !model.claimText;
};

export function MistakesClaimBlock({ section, ctx }) {
  const model = mistakesClaimModel(section.data);
  const { tx, page } = ctx;
  const titleId = model.heading ? `${section.anchor}-title` : undefined;
  const mistakesId = `${section.anchor}-mistakes`;
  const claimId = `${section.anchor}-claim`;
  const hasClaim = Boolean(model.claimText || model.claimLabel);

  return (
    <BlockShell
      section={section}
      ctx={ctx}
      labelledBy={titleId}
      ariaLabel={section.label}
      className="bg-[#e4ece7]"
    >
      <BandHead id={titleId} eyebrow={model.eyebrow} heading={model.heading} center />

      <div className={cn("mx-auto mt-8 grid gap-5", model.mistakes.length && hasClaim ? "max-w-5xl lg:grid-cols-2" : "max-w-2xl")}>
        {model.mistakes.length > 0 && (
          <section
            aria-labelledby={mistakesId}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(9,38,62,0.5)] md:p-7"
          >
            <h3 id={mistakesId} className="wc2-side-title !m-0">
              {model.mistakesTitle || tx("stageMistakes", "Common mistakes")}
            </h3>
            <ul className="m-0 mt-4 grid list-none gap-0 p-0">
              {model.mistakes.map((text, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-3 py-3 text-[15px] leading-6 text-[#09263e] ${index > 0 ? "border-t border-slate-200" : ""}`}
                >
                  <Info className="mt-0.5 size-[18px] shrink-0 text-[#b3472d]" aria-hidden="true" />
                  <span className="min-w-0">{text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasClaim && (
          <section
            aria-labelledby={claimId}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(9,38,62,0.5)] md:p-7"
          >
            <h3 id={claimId} className="wc2-side-title !m-0">
              {model.claimTitle || tx("claimStuck", "Claim stuck?")}
            </h3>
            <Plain className="mt-4 max-w-[52ch] !text-base !leading-7 !text-[#09263e]">{model.claimText}</Plain>
            {model.claimLabel && (
              <div className="mt-auto pt-6">
                <EnquiryTrigger
                  className={CTA_BUTTON}
                  kind="enquiry"
                  source={sourceSlug(`claim-${model.claimPreset || section.anchor}`)}
                  serviceName={model.claimTitle || section.label || undefined}
                  pageTitle={page.h1}
                >
                  {model.claimLabel}
                  <span aria-hidden="true">→</span>
                </EnquiryTrigger>
              </div>
            )}
          </section>
        )}
      </div>
    </BlockShell>
  );
}
