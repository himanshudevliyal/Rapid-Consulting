/**
 * ContactPage - the Contact page (Figma 1538-84837).
 *
 * Layout (top to bottom):
 *   1. Breadcrumb (Home / Contact)
 *   2. Hero: eyebrow, h1, the page's own introduction, contact links, WhatsApp |
 *      the one main form card "Get a free first check." (FigmaEnquiryCard,
 *      source "contact-page"). There is no second form further down; the footer's
 *      closing panel is the site-wide one.
 *   3. What happens next (3 steps) and the manuscript's "useful starting points"
 *   4. Visit us (address, phone, WhatsApp, email, hours placeholder, directions, map placeholder)
 *
 * The form posts to the existing POST /enquiries endpoint (useSubmitEnquiry): name,
 * Indian mobile validation, honeypot and untouched consent come from FigmaEnquiryCard.
 */
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { FigmaEnquiryCard } from "@/components/forms/figma-enquiry-card";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, BTN_OUTLINE } from "@/components/home/styles";
import { Band, HeroBand, PROSE_CARD, PlaceholderChip, StepCards, WhatsAppOutline } from "@/components/pages/b2e-ui";
import { Html } from "@/components/pages/content-primitives";
import { OfficeMap } from "@/components/ui/office-map";
import { BLOCKS, blockFor } from "@/components/site-pages/block-registry";
import { siteText } from "@/components/site-pages/site-text";
import { crumbsFrom, first, localHref, managedCardProps, mergeCard, paragraphs, rows, text as str } from "@/lib/content/managed-text";
import { b2eText } from "@/lib/pages/b2e-copy";
import { homeText } from "@/lib/pages/home-copy";
import { EMAIL, PHONE_HREF, PHONE_LABEL, WHATSAPP_LABEL, WHATSAPP_NUMBER } from "@/lib/site";

const RUST_LINK =
  "font-semibold text-[#922e0c]! underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

// The intro minus the paragraph that only repeats the WhatsApp number (shown as a link instead).
const withoutNumberOnlyParagraphs = (html = "") =>
  html.replace(/<p>\s*<a href="https:\/\/wa\.me[^"]*">[^<]*<\/a>\s*<\/p>/g, "");

const plain = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const paragraphsOf = (html = "") => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((match) => match[1]);

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8efec] text-[#1f5d57]">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{label}</dt>
        <dd className="m-0 mt-1 text-[17px] font-medium leading-6 text-[#09263e]">{children}</dd>
      </div>
    </div>
  );
}

// `managed` is the managed page "contact" (admin panel -> Pages) or null: its hero
// supplies the text of the hero and of the enquiry card, and a field left empty
// keeps the wording below. Sections an editor adds after the hero are drawn by the
// generic page renderer.
export function ContactPage({ page, t, has, managed = null }) {
  const locale = page.locale;
  const text = b2eText(t);
  const home = homeText(t, has, locale);
  const hero = managed?.get("hero") ?? {};
  const crumbs = crumbsFrom(hero.breadcrumb, locale, `/${locale}/contact`, [
    { label: t("common.home"), href: `/${locale}` },
    { label: text("common.contact"), href: `/${locale}/contact` },
  ]);
  const extraSections = (managed?.list ?? []).filter((section) => section.anchor !== "hero" && blockFor(section.type));
  const ctxFor = (index) => ({
    page: managed.page,
    locale,
    t,
    tx: siteText(t),
    has,
    records: {},
    topic: "",
    stages: [],
    inColumn: false,
    tone: index % 2 ? "plain" : "wash",
  });
  const contactLinks = rows(hero.links).filter((link) => str(link.label));
  const secondaryLabel = first(hero.secondary_label, text("common.chatWhatsapp"));
  const secondaryHref = localHref(hero.secondary_href, locale);

  // Manuscript sections, by position (the ids differ between English and Hindi):
  // 0 request a callback, 1 speak directly, 2 after the first discussion, 3 starting points.
  const after = page.sections[2];
  const starting = page.sections[3];
  const startingTips = paragraphsOf(starting?.html);
  const afterIntro = paragraphsOf(after?.html)[0];

  const street = t.has?.("b2e.contact.visit.street") ? t("b2e.contact.visit.street") : "";
  const office = [street, text("contact.officeValue")].filter(Boolean).join(", ");
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Rapid Consulting, ${office}`)}`;
  const callHref = `tel:+${WHATSAPP_NUMBER}`;

  const cardTitle = first(hero.card_title, text("contact.form.title"));
  const card = mergeCard(
    {
      title: cardTitle,
      seal: "free",
      source: "contact-page",
      pageId: page.id,
      pageTitle: page.h1,
      serviceName: cardTitle,
      select: {
        label: text("contact.form.choice"),
        required: true,
        options: [text("contact.form.haryana"), text("contact.form.another"), text("contact.form.notSure")],
        placeholder: text("contact.form.choicePlaceholder"),
      },
      fields: ["district", "activity"],
      labels: {
        name: home("homeA.form.name"),
        phone: home("homeA.form.phone"),
        district: text("contact.form.district"),
        activity: text("contact.form.activity"),
        optional: text("contact.form.optional"),
        choiceError: text("contact.form.choiceError"),
        consent: home("homeA.form.consent"),
        consentHelp: home("homeA.form.consentHelp"),
        another: home("homeA.form.another"),
      },
      submitLabel: text("contact.form.submit"),
      helper: text("contact.form.helper"),
      whatsapp: true,
      whatsappLabel: text("common.chatWhatsapp"),
    },
    managedCardProps(hero),
  );
  const form = <FigmaEnquiryCard id="contact-form" {...card} />;

  return (
    <>
      <Breadcrumbs items={crumbs} t={t} />
      <main id="main">
        <HeroBand
          id="contact-title"
          eyebrow={first(hero.eyebrow, text("contact.eyebrow"))}
          title={first(hero.heading, text("contact.title"))}
          intro={
            str(hero.intro) ? (
              paragraphs(hero.intro).map((part, index) => <p key={index}>{part}</p>)
            ) : (
              <Html html={withoutNumberOnlyParagraphs(page.introHtml)} />
            )
          }
          extra={
            <ul className="m-0 mt-6 grid list-none gap-2 p-0 text-base text-slate-800">
              {contactLinks.length > 0 ? (
                <>
                  {contactLinks.map((link, index) => (
                    <li key={index}>
                      <a href={localHref(link.href, locale)} className={RUST_LINK}>
                        {str(link.label)}
                      </a>
                    </li>
                  ))}
                  {str(hero.plain_text) && <li>{str(hero.plain_text)}</li>}
                </>
              ) : (
              <>
              <li>
                {text("contact.callLabel")}{" "}
                <a href={callHref} className={RUST_LINK}>
                  {WHATSAPP_LABEL}
                </a>
              </li>
              <li>
                {text("contact.emailLabel")}{" "}
                <a href={`mailto:${EMAIL}`} className={RUST_LINK}>
                  {EMAIL}
                </a>
              </li>
              <li>
                {text("contact.officeLabel")}{" "}
                <a href="#visit-us" className={RUST_LINK}>
                  {office}
                </a>
              </li>
              </>
              )}
            </ul>
          }
          actions={
            secondaryHref ? (
              <a href={secondaryHref} className={`${BTN_OUTLINE} w-full sm:w-auto`}>
                {secondaryLabel}
              </a>
            ) : (
              <WhatsAppOutline label={secondaryLabel} className="w-full sm:w-auto" />
            )
          }
          aside={form}
        />

        {extraSections.map((section, index) => {
          const { Component } = BLOCKS[section.type];
          return <Component key={section.id} section={section} ctx={ctxFor(index)} />;
        })}

        <Band id="what-happens-next" labelledBy="contact-next-title">
          <SectionHeading
            id="contact-next-title"
            eyebrow={text("contact.next.eyebrow")}
            title={text("contact.next.title")}
            intro={afterIntro ? plain(afterIntro) : undefined}
          />
          <div className="mt-8">
            <StepCards
              steps={[1, 2, 3].map((n) => ({ title: text(`contact.next.s${n}.title`), text: text(`contact.next.s${n}.text`) }))}
            />
          </div>
          <div className="mt-8">
            <Link href={`/${locale}/how-we-work`} className={BTN_LIME}>
              {text("contact.next.cta")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Band>

        {starting && startingTips.length > 0 && (
          <Band id={starting.id} tone="sage" labelledBy={`${starting.id}-title`}>
            <SectionHeading id={`${starting.id}-title`} title={starting.title} />
            <ul className="m-0 mt-8 grid list-none gap-5 p-0 sm:grid-cols-2">
              {startingTips.map((tip, index) => (
                <li key={index} className="m-0 rounded-2xl border border-slate-200 bg-white p-6">
                  <Html html={`<p>${tip}</p>`} className={PROSE_CARD} />
                </li>
              ))}
            </ul>
          </Band>
        )}

        <Band id="visit-us" tone="grey" labelledBy="contact-visit-title">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div>
              <SectionHeading id="contact-visit-title" eyebrow={text("contact.visit.eyebrow")} title={text("contact.visit.title")} />
              <dl className="m-0 mt-6 rounded-2xl border border-slate-200 bg-white px-5">
                <DetailRow icon={MapPin} label={text("contact.visit.address")}>
                  {office}
                </DetailRow>
                <DetailRow icon={Phone} label={text("contact.visit.phone")}>
                  <a href={PHONE_HREF} className="text-[#09263e]! no-underline hover:underline">
                    {PHONE_LABEL}
                  </a>
                </DetailRow>
                <DetailRow icon={MessageCircle} label={text("contact.visit.whatsapp")}>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#09263e]! no-underline hover:underline"
                  >
                    {WHATSAPP_LABEL}
                  </a>
                </DetailRow>
                <DetailRow icon={Mail} label={text("contact.visit.email")}>
                  <a href={`mailto:${EMAIL}`} className="break-all text-[#09263e]! no-underline hover:underline">
                    {EMAIL}
                  </a>
                </DetailRow>
                <DetailRow icon={Clock} label={text("contact.visit.hours")}>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {text("contact.visit.hoursValue")}
                    <PlaceholderChip>{text("contact.visit.hoursNote")}</PlaceholderChip>
                  </span>
                </DetailRow>
              </dl>
              <div className="mt-6">
                <a href={directions} target="_blank" rel="noopener noreferrer" className={BTN_OUTLINE}>
                  {text("contact.visit.directions")}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>
            <OfficeMap title={text("contact.visit.map")} />
          </div>
        </Band>
      </main>
    </>
  );
}
