import { ArrowUpRight } from "lucide-react";

import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { asArray, asText, sourceSlug } from "@/lib/content/site-page-adapters";
import { BandHead } from "./band";
import { CTA_BUTTON } from "./masthead";
import { BlockShell, SmartLink } from "./shared";

// "The route": a numbered timeline (01, 02, 03 ...) down the page. Each step
// has a title, rows that start with a bold lead and link chips to the pages for
// that step. A link with no address renders as a plain chip (no dead link). The
// vertical line and the number badges are styled in styles/b2a.css (.b2a-route).

const itemsOf = (data) =>
  asArray(data.items)
    .map((item) => ({
      title: asText(item?.title),
      rows: asArray(item?.rows)
        .map((row) => ({ lead: asText(row?.lead), text: asText(row?.text) }))
        .filter((row) => row.lead || row.text),
      links: asArray(item?.links)
        .map((link) => ({ label: asText(link?.label), href: asText(link?.href) }))
        .filter((link) => link.label),
    }))
    .filter((item) => item.title);

export const roadmapTimelineEmpty = (data) => itemsOf(data).length === 0;

const CHIP =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#09263e]/25 bg-white px-3.5 text-[13px] font-semibold text-[#09263e] no-underline";

export function RoadmapTimelineBlock({ section, ctx }) {
  const { data } = section;
  const items = itemsOf(data);
  const { tx, page, locale } = ctx;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const cta = asText(data.cta_label);

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />

      <ol className="b2a-route m-0 mt-8 grid list-none gap-5 p-0">
        {items.map((item, index) => (
          <li key={index} className="b2a-route__step relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 sm:gap-x-5">
            <span
              aria-hidden="true"
              className="b2a-route__badge flex size-11 items-center justify-center rounded-full bg-[#09263e] text-sm font-bold text-white"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <span className="sr-only">{tx("stepLabel", "Step {n}", { n: index + 1 })}: </span>
              <h3 className="!m-0 !text-xl !font-semibold !leading-snug !tracking-[-0.01em] !text-[#09263e]">{item.title}</h3>
              {item.rows.length > 0 && (
                <ul className="m-0 mt-3 grid list-disc gap-2 pl-5 marker:text-[#1f5d57]">
                  {item.rows.map((row, rowIndex) => (
                    <li key={rowIndex} className="text-[15px] leading-6 text-slate-700">
                      {row.lead && <strong className="font-semibold text-[#09263e]">{row.lead}</strong>}
                      {row.lead && row.text ? " " : ""}
                      {row.text}
                    </li>
                  ))}
                </ul>
              )}
              {item.links.length > 0 && (
                <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                  {item.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.href ? (
                        <SmartLink
                          href={link.href}
                          locale={locale}
                          className={`${CHIP} !text-[#09263e] transition-colors hover:border-[#09263e] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2`}
                        >
                          {link.label}
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </SmartLink>
                      ) : (
                        <span className={CHIP}>{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      {cta && (
        <div className="mt-8">
          <EnquiryTrigger
            className={CTA_BUTTON}
            kind="enquiry"
            source={sourceSlug(`route-${asText(data.cta_preset) || section.anchor}`)}
            serviceName={section.label || heading || undefined}
            pageTitle={page.h1}
          >
            {cta}
            <span aria-hidden="true">→</span>
          </EnquiryTrigger>
        </div>
      )}
    </BlockShell>
  );
}
