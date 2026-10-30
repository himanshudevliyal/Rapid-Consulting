import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { cn } from "@/lib/utils";
import { asArray, asText, sourceSlug } from "@/lib/content/site-page-adapters";
import { BandHead } from "./band";
import { CTA_BUTTON } from "./masthead";
import { BlockShell } from "./shared";

// Numbered step cards in a row (01 ... 04). The last card can be highlighted
// (a soft green, with a teal number: static labels keep the quiet colour, the
// lime stays on the button). Used for "From eligibility to payment" on the
// Subsidies hub. Inside the rail column the cards go two across.

const itemsOf = (data) =>
  asArray(data.items)
    .map((item) => ({ title: asText(item?.title), text: asText(item?.text) }))
    .filter((item) => item.title || item.text);

export const timelineStepsEmpty = (data) => itemsOf(data).length === 0;

export function TimelineStepsBlock({ section, ctx }) {
  const { data } = section;
  const items = itemsOf(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const highlight = data.highlight_last === true || data.highlight_last === "true";
  const cta = asText(data.cta_label);
  const preset = asText(data.cta_preset);
  const { tx, page, inColumn } = ctx;

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />

      <ol
        className={cn(
          "m-0 mt-8 grid list-none gap-4 p-0",
          inColumn ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {items.map((item, index) => {
          const last = highlight && index === items.length - 1 && items.length > 1;
          return (
            <li
              key={index}
              className={cn(
                "b2a-step flex min-w-0 flex-col rounded-2xl border p-5",
                last ? "border-[#1f5d57]/40 bg-[#dcefe2]" : "border-slate-200 bg-white",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("text-3xl font-bold leading-none tracking-tight", last ? "text-[#1f5d57]" : "text-[#09263e]")}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="sr-only">{tx("stepLabel", "Step {n}", { n: index + 1 })}: </span>
              {item.title && <h3 className="!m-0 !mt-4 !text-lg !font-semibold !leading-snug !text-[#09263e]">{item.title}</h3>}
              {item.text && <p className="!m-0 !mt-2 !text-[15px] !leading-6 !text-slate-700">{item.text}</p>}
            </li>
          );
        })}
      </ol>

      {cta && (
        <div className="mt-8">
          <EnquiryTrigger
            className={CTA_BUTTON}
            kind="enquiry"
            source={sourceSlug(`steps-${preset || section.anchor}`)}
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
