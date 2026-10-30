import { ArrowDown, ArrowUpRight } from "lucide-react";

import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { asText, sourceSlug, stageList } from "@/lib/content/site-page-adapters";
import { CTA_BUTTON } from "./masthead";
import { BlockHead, BlockShell, H3, NAV_OFFSET, Plain, SmartLink } from "./shared";

// "Your project": a row of stage cards that scroll to the stage below, and one
// panel per stage. The stage's primary button opens the enquiry drawer with the
// stage as its preset; the secondary link (the stage's own page) shows only
// when the editor set one. Stage ids are the stage keys, so /your-project#<key>
// links from the menu land on the right panel.
export function StageChooserBlock({ section, ctx }) {
  const data = section.data;
  const { tx, page } = ctx;
  const stages = stageList(data.stages);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BlockHead id={titleId} heading={heading} intro={asText(data.intro)} />

      <nav aria-label={tx("chooserLabel", "Choose your stage")}>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {stages.map((stage, index) => (
            <li key={stage.key} className="flex">
              <a
                href={`#${stage.key}`}
                className="group flex w-full flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-[#09263e] no-underline transition-colors hover:border-[#09263e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex items-end justify-between gap-2 text-[15px] font-semibold leading-snug">
                  {stage.title}
                  <ArrowDown
                    className="size-4 shrink-0 transition-transform group-hover:translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 grid gap-5">
        {stages.map((stage, index) => {
          const headingId = `${stage.key}-heading`;
          return (
            <article
              key={stage.key}
              id={stage.key}
              tabIndex={-1}
              aria-labelledby={headingId}
              className={`${NAV_OFFSET} grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8`}
            >
              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <H3 id={headingId} className="mt-1 !text-2xl">
                  {stage.title}
                </H3>
                <Plain className="mt-3 max-w-[62ch]">{stage.text}</Plain>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-stretch">
                <EnquiryTrigger
                  className={CTA_BUTTON}
                  kind="enquiry"
                  source={sourceSlug(`stage-${stage.key}`)}
                  serviceName={stage.title}
                  pageTitle={page.h1}
                >
                  {stage.primaryLabel || tx("stageCta", "Discuss this stage")}
                  <span aria-hidden="true">↗</span>
                </EnquiryTrigger>
                {stage.pageHref && (
                  <SmartLink
                    href={stage.pageHref}
                    locale={ctx.locale}
                    className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-[#09263e]/25 px-5 text-sm font-semibold !text-[#09263e] no-underline transition-colors hover:border-[#09263e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]"
                  >
                    {tx("stagePage", "Read about this stage")}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </SmartLink>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </BlockShell>
  );
}

export const stageChooserEmpty = (data) => stageList(data.stages).length === 0;
