import { Html } from "@/components/common/html";
import { asArray, asText, hasHtml } from "@/lib/content/site-page-adapters";
import { BandHead } from "./band";
import { BlockShell } from "./shared";

// "Quick answers": a grey card of question and answer rows. The question is
// bold on the left, the answer sits beside it (stacked on a phone); a small
// SUMMARY label heads the card. Answers are editor HTML, so links in them (the
// rust "Three things decide it" style jump links) work; they are styled in
// styles/b2a.css (.b2a-qa).

const itemsOf = (data) =>
  asArray(data.items)
    .map((item) => ({ question: asText(item?.question), answerHtml: asText(item?.answer_html) }))
    .filter((item) => item.question && hasHtml(item.answerHtml));

export const qaListEmpty = (data) => itemsOf(data).length === 0;

export function QaListBlock({ section, ctx }) {
  const { data } = section;
  const items = itemsOf(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const summary = asText(data.summary_label) || ctx.tx("qaSummary", "Summary");

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} className="mb-6" />

      <div className="b2a-qa rounded-2xl border border-slate-200 bg-[#f1f4f2] p-5 sm:p-7">
        <p className="wc2-side-title !m-0">{summary}</p>
        <dl className="m-0 mt-3 grid gap-0">
          {items.map((item, index) => (
            <div
              key={index}
              className={`grid gap-x-8 gap-y-1.5 py-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] ${index > 0 ? "border-t border-slate-300/70" : ""}`}
            >
              <dt className="m-0 text-[15px] font-semibold leading-6 text-[#09263e]">{item.question}</dt>
              <dd className="m-0 min-w-0">
                <Html html={item.answerHtml} className="!text-[15px] !leading-6 text-slate-700 [&_p]:m-0" />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {asText(data.footnote) && <p className="!m-0 !mt-3 !text-sm !text-slate-600">{asText(data.footnote)}</p>}
    </BlockShell>
  );
}
