import { WhatsAppButton } from "@/components/contact/whatsapp";
import { AuthorReviewer } from "@/components/common/author-reviewer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { Html } from "@/components/common/html";
import { Icon } from "@/components/common/icon";
import { ShareActions } from "@/components/common/share-actions";
import { CaseEvidence, CaseGlance } from "@/components/pages/case-evidence";
import { pageHref } from "@/lib/pages/content";
import { rewriteContentLinks } from "@/lib/page-routes";
import { GreyCard, Checklist, LimeAction, NavyPanel, Rich, RichActions, TextLink } from "./blocks";
import { CaseGrid } from "./extras";
import { EnquiryRail } from "./rail";
import { ContentLayout, Masthead, SectionBlock } from "./shell";
import { LIME_BUTTON, b2cText, enquirySource, H2 } from "./text";
import { hasContent, listItems, parseDoneRows, plainParagraphs } from "./html-utils";

// Case study detail page (Figma 1430-72317): breadcrumb, "CASE STUDY (+ DRAFT
// CASE)" masthead with the "At a glance" card, the body with the rail "Check
// your claim before you buy.", THE NEED, a navy callout, WHAT RAPID DID as
// numbered rows, a checklist card, and RELATED CASES under the rail (the rail
// stops above them because they sit after the two-column grid).
//
// Everything about the case comes from its record. Rows the record lacks are
// left out. The rows' "Client provided | Rapid recorded or handled" columns are
// read from an ordered list in the "What Rapid did" text when it has labelled
// lines; otherwise that text shows as written.

const RELATED = 3;

function DoneRows({ rows, tx }) {
  return (
    <ol className="m-0 grid list-none gap-4 p-0">
      {rows.map((row, index) => (
        <li key={index} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-sm font-bold text-white"
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              {row.title ? (
                <h3 className="!m-0 !text-[17px] !font-semibold !leading-snug !text-[#09263e]">{row.title}</h3>
              ) : null}
              {row.body && <Rich html={row.body} className={row.title ? "mt-1 !text-[15px]" : "!text-[15px]"} />}
              {(row.client || row.rapid) && (
                <div className={`grid gap-3 sm:grid-cols-2 ${row.title || row.body ? "mt-3" : ""}`}>
                  {row.client && (
                    <div className="rounded-xl bg-[#f3f5f6] p-3.5">
                      <p className="wc2-eyebrow !m-0 !text-[10px]">{tx("case.clientProvided", "Client provided")}</p>
                      <Html html={rewriteContentLinks(row.client)} className="b2c-prose mt-1 !text-[15px] !leading-6" />
                    </div>
                  )}
                  {row.rapid && (
                    <div className="rounded-xl bg-[#e8eee9] p-3.5">
                      <p className="wc2-eyebrow !m-0 !text-[10px]">{tx("case.rapidDid", "Rapid recorded or handled")}</p>
                      <Html html={rewriteContentLinks(row.rapid)} className="b2c-prose mt-1 !text-[15px] !leading-6" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export async function CaseView({ page, t, has }) {
  const tx = b2cText(t);
  const source = enquirySource("case", page.slug);

  const paragraphs = plainParagraphs(page.introHtml);
  const sub = paragraphs[0] || "";
  const moreIntro = paragraphs.slice(1).join("");

  const sections = page.sections.filter((s) => hasContent(s.html));
  const need = sections.filter((s) => s.part === "challenge");
  const did = sections.filter((s) => s.part === "solution");
  // Anything else (the result, or a record read without part markers) follows.
  const outcome = sections.filter((s) => s.part !== "challenge" && s.part !== "solution");

  // Other published cases; the same industry first.
  const sectorKey = (page.industry || page.sector || "").toLowerCase();
  const related = (page.relatedItems ?? [])
    .filter((item) => item.type === "case-study" && item.id !== page.id)
    .sort((a, b) => {
      const same = (item) => ((item.industry || item.sector || "").toLowerCase() === sectorKey ? 0 : 1);
      return same(a) - same(b);
    })
    .slice(0, RELATED);

  const eyebrow = page.isDraft
    ? `${tx("case.eyebrow", "Case study")} · ${tx("case.draft", "Draft case")}`
    : tx("case.eyebrow", "Case study");

  const checklist = [
    tx("case.check.1", "The scheme or policy you are relying on, and its date"),
    tx("case.check.2", "The quotation or invoice for what you plan to buy"),
    tx("case.check.3", "Proof of payment, once you have paid"),
    tx("case.check.4", "Your unit's registration and approvals"),
    tx("case.check.5", "The dates: order, delivery, installation and first use"),
  ];

  // "What Rapid did": the numbered rows (client / Rapid columns) read from an ordered
  // list, with the text before and after it (a button at the end is allowed).
  const renderDid = (section, index = 0, rowsOnly = false) => {
    const { before, rows, after } = parseDoneRows(section.html);
    const actionSource = `${source}-${section.id}`.slice(0, 60);
    return (
      <div key={section.id} id={rowsOnly ? undefined : section.id} className={`b2c-anchor ${index ? "mt-10" : ""}`}>
        {!rowsOnly && section.title && <h3 className="!m-0 !mb-3 !text-xl !font-semibold !leading-snug !text-[#09263e]">{section.title}</h3>}
        {rows.length ? (
          <>
            <Rich html={before} className="mb-4" />
            <DoneRows rows={rows} tx={tx} />
            <RichActions html={after} source={actionSource} pageTitle={page.h1} className="mt-4" />
          </>
        ) : (
          <RichActions html={section.html} source={actionSource} pageTitle={page.h1} />
        )}
      </div>
    );
  };

  const hasNavy = sections.some((section) => section.tone === "navy");
  const hasGrey = sections.some((section) => section.tone === "grey");

  return (
    <main id="main">
      <Breadcrumbs page={page} t={t} />
      <Masthead
        eyebrow={eyebrow}
        title={page.h1}
        titleId="case-title"
        sub={
          sub ? (
            <Html html={rewriteContentLinks(sub)} className="[&_p]:!m-0 !text-[17px] !leading-8" />
          ) : page.description ? (
            <p className="m-0">{page.description}</p>
          ) : null
        }
        actions={
          <>
            <LimeAction source={source} pageTitle={page.h1}>
              {t("service.discussProject")}
            </LimeAction>
            <WhatsAppButton />
          </>
        }
        aside={<CaseGlance page={page} t={t} />}
      />

      <ContentLayout
        label={tx("rail.label", "Enquiry")}
        rail={
          <EnquiryRail
            t={t}
            title={tx("case.railTitle", "Check your claim before you buy.")}
            source={source}
            pageId={page.id}
            pageTitle={page.h1}
            select={{
              label: tx("case.buying", "What are you buying?"),
              placeholder: tx("rail.choose", "Choose one"),
              options: [
                tx("case.buy.testing", "Testing equipment"),
                tx("case.buy.safety", "Fire or safety equipment"),
                tx("case.buy.machinery", "Production machinery"),
                tx("case.buy.building", "A building or land"),
                tx("case.buy.other", "Something else"),
              ],
            }}
            fields={["district", "activity"]}
            activityLabel={tx("case.yourUnit", "Your unit")}
            submitLabel={tx("case.railCta", "Check my claim")}
          />
        }
      >
        <AuthorReviewer page={page} t={t} className="!mt-0" />
        {/* A draft case carries its own "Draft case" label instead of the review note. */}
        {page.reviewLabel !== "Draft" && !page.isDraft && (
          <aside className="my-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#f3f5f6] p-4 text-sm leading-6 text-slate-700">
            <Icon name="clipboard-text" />
            <p className="m-0">
              <strong className="text-[#09263e]">{t("site.review.caseTitle")} · </strong>
              {t("site.review.caseText")}
            </p>
          </aside>
        )}

        {hasContent(moreIntro) && (
          <SectionBlock id="case-intro">
            <Rich html={moreIntro} />
          </SectionBlock>
        )}

        {/* The record's own sections, in order. A heading may carry data-eyebrow and
            data-tone="navy" | "grey" (see adapters.splitSections); the wording of the
            default blocks below is used only when the record has no such section. */}
        {sections.map((section) => {
          const first = (list) => list[0]?.id === section.id;
          const eyebrow =
            section.eyebrow ||
            (first(need) ? tx("case.need", "The need") : first(did) ? tx("case.did", "What Rapid did") : first(outcome) ? tx("case.outcome", "The outcome") : "");
          const sectionSource = `${source}-${section.id}`.slice(0, 60);
          const body =
            section.part === "solution" ? (
              renderDid(section)
            ) : (
              <RichActions html={section.html} source={sectionSource} pageTitle={page.h1} tone={section.tone === "navy" ? "navy" : undefined} />
            );
          if (section.tone === "navy") {
            return (
              <NavyPanel key={section.id} id={section.id} eyebrow={eyebrow} title={section.title}>
                {body}
              </NavyPanel>
            );
          }
          if (section.tone === "grey") {
            const items = listItems(section.html);
            const rest = section.html.replace(/<ul[^>]*>[\s\S]*?<\/ul>/i, "");
            return (
              <GreyCard key={section.id} id={section.id} eyebrow={eyebrow} title={section.title}>
                {items.length ? <Checklist items={items} /> : null}
                <RichActions html={items.length ? rest : section.html} source={sectionSource} pageTitle={page.h1} className="mt-4" />
              </GreyCard>
            );
          }
          if (section.part === "solution") {
            return (
              <SectionBlock key={section.id} id={section.id} eyebrow={eyebrow} title={section.title}>
                {renderDid(section, 0, true)}
              </SectionBlock>
            );
          }
          return (
            <SectionBlock key={section.id} id={section.id} eyebrow={eyebrow} title={section.title}>
              {body}
            </SectionBlock>
          );
        })}

        {!hasNavy && (
          <NavyPanel
            id="check-claim"
            eyebrow={tx("case.callout.eyebrow", "Before you buy")}
            title={tx("case.callout.title", "A claim rests on its records.")}
            action={
              <LimeAction source={`${source}-callout`.slice(0, 60)} pageTitle={page.h1}>
                {tx("case.callout.cta", "Get my claim checked")}
              </LimeAction>
            }
          >
            <p className="m-0 max-w-[60ch] text-base leading-7 text-white/85">
              {tx("case.callout.text", "Rapid checks the scheme rules, the invoice and the dates before you buy, not after.")}
            </p>
          </NavyPanel>
        )}

        <CaseEvidence page={page} t={t} />

        {!hasGrey && (
          <GreyCard
            id="bring-to-a-check"
            eyebrow={tx("case.check.eyebrow", "Before you commit")}
            title={tx("case.check.title", "Bringing a purchase to a check? Have these ready.")}
            action={
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <LimeAction source={`${source}-check`.slice(0, 60)} pageTitle={page.h1}>
                  {tx("case.check.cta", "Get my claim checked")}
                </LimeAction>
                <TextLink href={pageHref("R02", page.locale)}>{t("detail.nextSteps.schemes")}</TextLink>
                <TextLink href={`/${page.locale}/services`}>{t("detail.nextSteps.services")}</TextLink>
              </div>
            }
          >
            <Checklist items={checklist} />
          </GreyCard>
        )}

        <div className="mt-10">
          <ShareActions title={page.h1} />
        </div>
      </ContentLayout>

      {related.length > 0 && (
        <section id="related-cases" aria-labelledby="related-cases-title" className="b2c-anchor bg-[#f3f5f6] py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="wc2-eyebrow !m-0">{tx("case.related.eyebrow", "Related cases")}</p>
                <h2 id="related-cases-title" className={`${H2} !mt-2`}>
                  {tx("case.related.title", "More cases like this one.")}
                </h2>
              </div>
              <a className={LIME_BUTTON} href={pageHref("W00", page.locale)}>
                {tx("case.related.all", "View all case studies")} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="mt-8">
              <CaseGrid items={related} t={t} has={has} locale={page.locale} />
            </div>
          </div>
        </section>
      )}
      <ClientTicker />
    </main>
  );
}
