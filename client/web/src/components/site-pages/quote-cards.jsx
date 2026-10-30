import { Carousel } from "@/components/home/carousel";
import { asArray, asText } from "@/lib/content/site-page-adapters";
import { BandHead, columnItems } from "./band";
import { BlockShell } from "./shared";

// "What you may hear": navy tiles in a carousel, each a statement an owner is
// told and (optionally) a short note under it, with a small label, for
// example THE PORTAL. The tiles are editorial statements, not testimonials.

const itemsOf = (data) =>
  asArray(data.items)
    .map((item) => ({
      quote: asText(item?.quote),
      noteLabel: asText(item?.note_label),
      note: asText(item?.note),
    }))
    .filter((item) => item.quote);

export const quoteCardsEmpty = (data) => itemsOf(data).length === 0;

export function QuoteCardsBlock({ section, ctx }) {
  const { data } = section;
  const items = itemsOf(data);
  const { tx, inColumn } = ctx;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <Carousel
        label={heading || section.label || tx("quotesRegion", "What you may hear")}
        previous={tx("quotesPrev", "Previous")}
        next={tx("quotesNext", "Next")}
        itemClassName={columnItems(inColumn)}
        lead={<BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />}
      >
        {items.map((item, index) => (
          <figure
            key={index}
            className="m-0 flex h-full min-h-[260px] flex-col rounded-2xl bg-[#09263e] p-6 text-white"
          >
            <span aria-hidden="true" className="block h-8 font-serif text-5xl font-bold leading-none text-[#eaff6b]">
              “
            </span>
            <blockquote className="m-0 mt-3 text-lg font-semibold leading-7 tracking-[-0.01em] text-white">
              {item.quote}
            </blockquote>
            {(item.noteLabel || item.note) && (
              <figcaption className="mt-auto border-t border-white/20 pt-4">
                {item.noteLabel && <p className="wc2-eyebrow wc2-eyebrow--on-navy !m-0">{item.noteLabel}</p>}
                {item.note && <p className="!m-0 !mt-1.5 !text-sm !leading-6 !text-white/85">{item.note}</p>}
              </figcaption>
            )}
          </figure>
        ))}
      </Carousel>
    </BlockShell>
  );
}
