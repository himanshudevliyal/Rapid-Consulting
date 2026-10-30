import { asArray, asText } from "@/lib/content/site-page-adapters";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { BandHead, LINK_BUTTON } from "./band";
import { BlockHead, BlockShell, H3, Plain, SmartLink } from "./shared";

const stepItems = (data) =>
  asArray(data.items)
    .map((item) => ({ title: asText(item?.title), text: asText(item?.text) }))
    .filter((item) => item.title || item.text);

export function StepsBlock({ section, ctx }) {
  const data = section.data;
  const items = stepItems(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      {asText(data.eyebrow) ? (
        <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} className="mb-6" />
      ) : (
        <BlockHead id={titleId} heading={heading} intro={asText(data.intro)} />
      )}
      <ol className="m-0 grid list-none gap-4 p-0">
        {items.map((item, index) => (
          <li
            key={index}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-[#e8efec] text-sm font-semibold text-[#1f5d57]"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <span className="sr-only">{ctx.tx("stepLabel", "Step {n}", { n: index + 1 })}: </span>
              {item.title && <H3>{item.title}</H3>}
              <Plain className={item.title ? "mt-1.5" : undefined}>{item.text}</Plain>
            </div>
          </li>
        ))}
      </ol>
      {asText(data.cta_label) && (
        <div className="mt-6">
          {asText(data.cta_href) ? (
            <SmartLink href={data.cta_href} locale={ctx.locale} className={LINK_BUTTON}>
              {asText(data.cta_label)}
              <span aria-hidden="true">→</span>
            </SmartLink>
          ) : (
            <EnquiryTrigger className={LINK_BUTTON} source="page-steps" pageTitle={ctx.page.h1}>
              {asText(data.cta_label)}
              <span aria-hidden="true">→</span>
            </EnquiryTrigger>
          )}
        </div>
      )}
    </BlockShell>
  );
}

export const stepsEmpty = (data) => stepItems(data).length === 0;
