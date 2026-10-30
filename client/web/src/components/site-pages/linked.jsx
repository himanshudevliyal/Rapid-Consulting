import { ArrowRight } from "lucide-react";

import { Carousel } from "@/components/home/carousel";
import { ContentCard as ServiceCard } from "@/components/common/content-card";
import { PersonCard } from "@/components/common/person-card";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { ContentCard } from "@/components/pages/content-card";
import { homeText } from "@/lib/pages/home-copy";
import { asText, safeHref } from "@/lib/content/site-page-adapters";
import { serviceHref } from "@/lib/site";
import { columnItems } from "./band";
import { BlockHead, BlockShell, SmartLink, cardGridClass } from "./shared";

// Blocks that show records kept elsewhere (schemes, services, case studies,
// articles, people). The renderer resolves the editor's picks to the public
// records first (ctx.records); a pick that no longer exists is already gone,
// so a block with nothing left to show is dropped before it gets here.

function LinkedShell({ section, ctx, children, columns = 3 }) {
  const data = section.data;
  const heading = asText(data.heading);
  const intro = asText(data.intro);
  const viewAll = safeHref(data.view_all_href);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <BlockHead id={titleId} heading={heading} intro={intro} className="mb-0" />
        {viewAll && (
          <SmartLink
            href={viewAll}
            locale={ctx.locale}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold !text-[#1f5d57] underline-offset-4 hover:!text-[#09263e] hover:underline"
          >
            {ctx.t("common.viewAll")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </SmartLink>
        )}
      </div>
      <ul className={`m-0 grid list-none gap-6 p-0 ${cardGridClass(columns, ctx.inColumn)}`}>{children}</ul>
    </BlockShell>
  );
}

const Cell = ({ children }) => <li className="flex min-w-0 [&>*]:w-full">{children}</li>;

export function LinkedSchemesBlock({ section, ctx }) {
  const items = ctx.records[section.id] ?? [];
  return (
    <LinkedShell section={section} ctx={ctx}>
      {items.map((item) => (
        <Cell key={item.id}>
          <ContentCard page={item} locale={ctx.locale} t={ctx.t} has={ctx.has} />
        </Cell>
      ))}
    </LinkedShell>
  );
}

export function LinkedArticlesBlock({ section, ctx }) {
  const items = ctx.records[section.id] ?? [];
  return (
    <LinkedShell section={section} ctx={ctx}>
      {items.map((item) => (
        <Cell key={`${item.type}-${item.id}`}>
          <ContentCard page={item} locale={ctx.locale} t={ctx.t} has={ctx.has} />
        </Cell>
      ))}
    </LinkedShell>
  );
}

export function LinkedCasesBlock({ section, ctx }) {
  const items = ctx.records[section.id] ?? [];
  const labels = caseCardLabels(homeText(ctx.t, ctx.has, ctx.locale));
  const card = (item) => (
    <CaseCard
      key={item.id}
      item={item}
      label={ctx.t("site.card.caseStudy")}
      cta={ctx.t("site.card.readCase")}
      labels={labels}
    />
  );

  // Carousel variant: one row with previous / next (the Home client-success look).
  if (section.variant === "carousel") {
    const data = section.data;
    const heading = asText(data.heading);
    const intro = asText(data.intro);
    const viewAll = safeHref(data.view_all_href);
    const titleId = heading ? `${section.anchor}-title` : undefined;
    return (
      <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
        <Carousel
          label={heading || section.label || ctx.t("site.card.caseStudy")}
          previous={ctx.tx("casesPrev", "Previous case studies")}
          next={ctx.tx("casesNext", "Next case studies")}
          itemClassName={columnItems(ctx.inColumn)}
          lead={<BlockHead id={titleId} heading={heading} intro={intro} className="mb-0" />}
        >
          {items.map(card)}
        </Carousel>
        {viewAll && (
          <p className="!m-0 !mt-5">
            <SmartLink
              href={viewAll}
              locale={ctx.locale}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold !text-[#1f5d57] underline-offset-4 hover:!text-[#09263e] hover:underline"
            >
              {ctx.t("common.viewAll")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </SmartLink>
          </p>
        )}
      </BlockShell>
    );
  }

  return (
    <LinkedShell section={section} ctx={ctx}>
      {items.map((item) => (
        <Cell key={item.id}>{card(item)}</Cell>
      ))}
    </LinkedShell>
  );
}

export function LinkedServicesBlock({ section, ctx }) {
  const items = ctx.records[section.id] ?? [];
  const typeLabel = (type) => (ctx.has(`card.types.${type}`) ? ctx.t(`card.types.${type}`) : ctx.t("card.types.service"));
  return (
    <LinkedShell section={section} ctx={ctx}>
      {items.map((service) => (
        <Cell key={service.code || service.slug}>
          <ServiceCard
            item={service}
            href={serviceHref(service, ctx.locale)}
            typeLabel={typeLabel(service.type)}
            englishTag={service.has_locale === false && ctx.locale !== "en" ? ctx.t("common.englishTag") : ""}
            actionLabel={ctx.t("card.explore")}
          />
        </Cell>
      ))}
    </LinkedShell>
  );
}

export function PeopleBlock({ section, ctx }) {
  const items = ctx.records[section.id] ?? [];
  return (
    <LinkedShell section={section} ctx={ctx} columns={3}>
      {items.map((person) => (
        <Cell key={person.id}>
          <PersonCard person={person} placeholderLabel={ctx.t("detail.people.placeholderProfile")} />
        </Cell>
      ))}
    </LinkedShell>
  );
}

// Nothing resolved (nothing picked, or every pick unpublished) -> no section.
export const linkedEmpty = (section, ctx) => !(ctx.records?.[section.id]?.length > 0);
