import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Carousel } from "@/components/home/carousel";
import { asArray, asText, localizeHref, safeHref } from "@/lib/content/site-page-adapters";
import { BandHead, columnItems } from "./band";
import { BlockShell, SmartLink } from "./shared";

// A row of case tiles (title; place, sector and Rapid's role as small rows)
// with previous / next. While real case studies are not published, the tiles
// are SAMPLES: each carries a "Sample case" label and the row a note saying so.
// The label stays until the editor switches `sample` off. No figure, outcome or
// client name is ever shown here.

const itemsOf = (data) =>
  asArray(data.items)
    .map((item) => ({
      title: asText(item?.title),
      location: asText(item?.location),
      sector: asText(item?.sector),
      role: asText(item?.role),
      href: safeHref(item?.href),
    }))
    .filter((item) => item.title);

export const caseTilesEmpty = (data) => itemsOf(data).length === 0;

function Tile({ item, sample, ctx }) {
  const { tx, locale } = ctx;
  const rows = [
    [tx("tileLocation", "Place"), item.location],
    [tx("tileSector", "Sector"), item.sector],
    [tx("tileRole", "Rapid's role"), item.role],
  ].filter(([, value]) => value);
  const body = (
    <>
      <span className="block bg-[#dfeaf6] px-5 py-4">
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#09263e]/70">
          {sample ? tx("sampleCase", "Sample case") : tx("caseLabel", "Case study")}
        </span>
        <span className="mt-2 flex items-start justify-between gap-3">
          <span className="block text-lg font-semibold leading-snug text-[#09263e]">{item.title}</span>
          {item.href && <ArrowUpRight className="mt-1 size-5 shrink-0 text-[#09263e]" aria-hidden="true" />}
        </span>
      </span>
      {rows.length > 0 && (
        <dl className="m-0 grid gap-2 px-5 py-4 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
              <dt className="m-0 text-slate-600">{label}</dt>
              <dd className="m-0 font-medium text-[#09263e]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
  const shell =
    "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left no-underline";
  return item.href ? (
    <Link
      href={localizeHref(item.href, locale)}
      className={`${shell} transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(9,38,62,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2`}
    >
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export function CaseTilesBlock({ section, ctx }) {
  const { data } = section;
  const items = itemsOf(data);
  const { tx, inColumn } = ctx;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const sample = data.sample === true || data.sample === "true";
  const viewAll = safeHref(data.view_all_href);

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <Carousel
        label={heading || section.label || tx("tilesRegion", "Case tiles")}
        previous={tx("tilesPrev", "Previous cases")}
        next={tx("tilesNext", "Next cases")}
        itemClassName={columnItems(inColumn)}
        lead={<BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />}
      >
        {items.map((item, index) => (
          <Tile key={`${item.title}-${index}`} item={item} sample={sample} ctx={ctx} />
        ))}
      </Carousel>
      {sample && (
        <p data-placeholder="true" className="!m-0 !mt-3 !text-xs !leading-5 !text-slate-600">
          {tx("sampleCasesNote", "Sample cases: these tiles show the layout. They are not real client cases.")}
        </p>
      )}
      {viewAll && (
        <p className="!m-0 !mt-4">
          <SmartLink
            href={viewAll}
            locale={ctx.locale}
            className="inline-flex items-center gap-2 text-sm font-semibold !text-[#1f5d57] underline-offset-4 hover:!text-[#09263e] hover:underline"
          >
            {ctx.t("common.viewAll")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </SmartLink>
        </p>
      )}
    </BlockShell>
  );
}
