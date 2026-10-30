import { ArrowUpRight } from "lucide-react";

import { asArray, asText, safeHref } from "@/lib/content/site-page-adapters";
import { BlockHead, BlockShell, H3, Plain, SmartLink, cardGridClass } from "./shared";

const cardItems = (data) =>
  asArray(data.items)
    .map((item) => ({
      title: asText(item?.title),
      text: asText(item?.text),
      href: safeHref(item?.href),
      linkLabel: asText(item?.link_label),
    }))
    .filter((item) => item.title);

// Title, short text and an optional link per card. The card is not one big
// link: the title stays a heading and the action is its own link.
export function CardGridBlock({ section, ctx }) {
  const data = section.data;
  const items = cardItems(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BlockHead id={titleId} heading={heading} intro={asText(data.intro)} />
      <ul className={`m-0 grid list-none gap-5 p-0 ${cardGridClass(data.columns, ctx.inColumn)}`}>
        {items.map((item, index) => (
          <li key={index} className="flex">
            <article className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(9,38,62,0.45)]">
              <H3>{item.title}</H3>
              <Plain className="mt-2">{item.text}</Plain>
              {item.href && (
                <SmartLink
                  href={item.href}
                  locale={ctx.locale}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-semibold !text-[#09263e] underline-offset-4 hover:underline"
                >
                  {item.linkLabel || ctx.tx("learnMore", "Learn more")}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </SmartLink>
              )}
            </article>
          </li>
        ))}
      </ul>
    </BlockShell>
  );
}

export const cardGridEmpty = (data) => cardItems(data).length === 0;
