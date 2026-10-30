import Link from "next/link";
import {
  Users,
  Building2,
  Briefcase,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import { Html } from "@/components/pages/content-primitives";
import { ContactExperience } from "@/components/form/contact-experience";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, BTN_OUTLINE } from "@/components/home/styles";
import { Band, CARD, H3_CLASS, HeroBand, PROSE_CARD, StepCards } from "@/components/pages/b2e-ui";
import { b2eText } from "@/lib/pages/b2e-copy";
import { mainSiteHref } from "@/lib/site";

const WHATSAPP_URL = "https://wa.me/919254049513";

/* ─── Static data ──────────────────────────────────────────────────────────── */

const AUDIENCES = [
  {
    icon: Briefcase,
    title: "CAs & Accounting Firms",
    blurb:
      "Help clients beyond regular compliance. Identify investment questions early and bring specialist subsidy and approval support into the conversation.",
    cta: "Connect financial records to the relevant project discussion when clients plan machinery, new units or expansions.",
  },
  {
    icon: Building2,
    title: "Bankers & Relationship Managers",
    blurb:
      "Understand a customer's project and the information behind it. Practical checklists and explanations of approval dependencies support better conversations.",
    cta: "Establish the activity, site, project stage and available records before introducing a requirement.",
  },
  {
    icon: Users,
    title: "Independent Consultants",
    blurb:
      "Bring a wider range of support through a defined collaboration. Rapid takes on the agreed specialist assignment while you contribute the expertise you already bring.",
    cta: "Involve Rapid where a client needs help with incentives, permissions or project preparation alongside your own work.",
  },
];

const PROCESS_STEPS = [
  {
    title: "Start with a short introduction",
    text: "Share your role, the client's activity, district, project stage and requirement. Agree who should join the first discussion.",
  },
  {
    title: "Define the work together",
    text: "Rapid discusses the requirement and identifies its proposed role — scope, fees, client-contact arrangements, responsibilities and communications.",
  },
  {
    title: "Move the work forward",
    text: "The business and advisers provide records within their responsibility. Rapid undertakes the agreed documentation, coordination and follow-ups.",
  },
];

const SERVICES = [
  { label: "Subsidies & Incentives", code: "S01" },
  { label: "Statutory Approvals", code: "S02" },
  { label: "Licences & Certifications", code: "S03" },
  { label: "Industrial Insurance", code: "S04" },
  { label: "Finance & Other Services", code: "S05" },
];

const PREVIEW_SCENARIOS = [
  {
    who: "CA / Accounting firm",
    ask: "A client asks about machinery purchase — is there a subsidy available for their sector and district?",
    use: "Share the relevant scheme details and checklist with the adviser before the client meeting.",
  },
  {
    who: "Banker / Relationship manager",
    ask: "What records and approvals does a project of this type typically require before disbursement?",
    use: "Share a stage-by-stage checklist tied to the project type and loan product.",
  },
  {
    who: "Independent consultant",
    ask: "A client needs both your advisory and specialist approval or subsidy work — how does a collaboration work?",
    use: "Rapid proposes a defined scope alongside yours. Client gets one coherent team, split by expertise.",
  },
];

const PARTNERSHIP_PRINCIPLES = [
  {
    num: "01",
    title: "Defined scope",
    body: "Each collaboration starts with a clear proposal — what Rapid does, what the adviser does, and how the client is kept informed.",
  },
  {
    num: "02",
    title: "No client poaching",
    body: "The client relationship stays with the adviser. Rapid operates within the agreed scope and does not build a parallel relationship outside it.",
  },
  {
    num: "03",
    title: "Transparent fees",
    body: "Rapid's fees are agreed upfront. There is no ambiguity about cost or who bears it — adviser and client know the arrangement before work begins.",
  },
];

const AUDIENCE_SECTION = "more-value-for-the-people-who-trust-your-advice";

/* ─── Component ────────────────────────────────────────────────────────────── */

export function AdvisersPage({ page, t, has, community = null }) {
  const text = b2eText(t);
  const locale = page.locale;
  const byId = Object.fromEntries((page.sections ?? []).map((s) => [s.id, s]));

  const sectionTool = byId["start-with-a-useful-tool"];
  const sectionWork = byId["see-the-work-and-meet-the-people"];
  const sectionCommunity = byId["explore-the-whatsapp-community"];
  const sectionPartnership = byId["explore-a-partnership-with-rapid"];
  const sectionCTA = byId["discuss-working-together"];

  const audienceCard = (
    <nav aria-labelledby="advisers-card-title" className={CARD}>
      <h2 id="advisers-card-title" className="m-0! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
        {text("advisers.cardTitle")}
      </h2>
      <ol className="m-0 mt-5 grid list-none gap-3 p-0">
        {[1, 2, 3].map((n, index) => (
          <li key={n}>
            <a
              href={`#${AUDIENCE_SECTION}`}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-[#09263e]! no-underline transition-colors hover:border-[#09263e] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
            >
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold leading-snug">{text(`advisers.cardS${n}`)}</span>
              <ChevronRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <main id="main">
      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <HeroBand
        id="advisers-title"
        eyebrow={text("advisers.eyebrow")}
        title={page.h1}
        intro={<Html html={page.introHtml} />}
        actions={
          <>
            <a href="#discuss-working-together" className={BTN_LIME}>
              {text("advisers.discuss")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href="#start-with-a-useful-tool" className={BTN_OUTLINE}>
              {text("advisers.toolLink")}
            </a>
          </>
        }
        aside={audienceCard}
      />

      {/* ── 2. Audience cards ────────────────────────────────────────────── */}
      <Band id={AUDIENCE_SECTION} labelledBy={`${AUDIENCE_SECTION}-title`}>
        <SectionHeading
          id={`${AUDIENCE_SECTION}-title`}
          eyebrow="Who this is for"
          title="More value for the people who trust your advice"
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, blurb, cta }) => (
            <article key={title} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7">
              <span className="flex size-12 items-center justify-center rounded-xl bg-[#09263e] text-[#eaff6b]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className={H3_CLASS}>{title}</h3>
              <p className="m-0! flex-1 text-[15px] leading-7 text-slate-700">{blurb}</p>
              <p className="m-0! rounded-xl bg-[#f4f7f5] px-4 py-3 text-sm leading-6 text-slate-700">
                <strong className="font-semibold text-[#09263e]">Put it to work: </strong>
                {cta}
              </p>
            </article>
          ))}
        </div>
      </Band>

      {/* ── 3. 6-question client tool ─────────────────────────────────────── */}
      {sectionTool && (
        <section id={sectionTool.id} aria-labelledby={`${sectionTool.id}-title`} className="scroll-mt-24 bg-white pb-12 sm:pb-16 lg:pb-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#09263e] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <SectionHeading id={`${sectionTool.id}-title`} tone="dark" eyebrow="Practical tool" title={sectionTool.title} />
              <div className="mt-8 max-w-5xl text-base leading-8 text-white/85 [&_a]:font-semibold [&_a]:text-[#eaff6b]! [&_a:hover]:underline [&_li]:rounded-xl [&_li]:bg-white/10 [&_li]:px-5 [&_li]:py-3 [&_li]:text-white [&_ol]:mt-4 [&_ol]:flex [&_ol]:list-none [&_ol]:flex-col [&_ol]:gap-3 [&_ol]:p-0 [&_p]:m-0 [&_p+p]:mt-4 [&_strong]:text-[#eaff6b]">
                <Html html={sectionTool.html} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Preview scenarios ─────────────────────────────────────────── */}
      <Band id="a-preview-of-useful-updates" tone="grey" labelledBy="advisers-preview-title">
        <SectionHeading
          id="advisers-preview-title"
          eyebrow="Community content preview"
          title="A preview of useful updates"
          intro="Examples of the kind of updates members receive."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PREVIEW_SCENARIOS.map(({ who, ask, use }) => (
            <article key={who} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-[#eef3f0] px-6 py-4">
                <p className="m-0! text-xs font-bold uppercase tracking-[0.14em] text-[#922e0c]">{who}</p>
              </div>
              <div className="flex flex-1 flex-col gap-4 px-6 py-5">
                <div>
                  <p className="m-0! mb-1! text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">Ask</p>
                  <p className="m-0! text-[15px] leading-6 text-[#09263e]">{ask}</p>
                </div>
                <div className="border-t border-dashed border-slate-300" />
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#1f5d57]" aria-hidden="true" />
                  <div>
                    <p className="m-0! mb-1! text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">How Rapid helps</p>
                    <p className="m-0! text-[15px] leading-6 text-slate-700">{use}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Band>

      {/* ── 5. Services ──────────────────────────────────────────────────── */}
      <Band id="specialist-support-for-your-clients-next-step" labelledBy="advisers-services-title">
        <SectionHeading
          id="advisers-services-title"
          eyebrow="Rapid's expertise"
          title="Specialist support for your client's next step"
        />
        <ul className="m-0 mt-8 flex list-none flex-wrap gap-3 p-0">
          {SERVICES.map(({ label, code }) => (
            <li key={code}>
              <Link
                href={mainSiteHref(code, locale, true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#09263e]/25 bg-white px-5 text-sm font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#eaff6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
              >
                <span>{label}</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Band>

      {/* ── 6. Work proof ────────────────────────────────────────────────── */}
      {sectionWork && (
        <Band id={sectionWork.id} tone="sage" labelledBy={`${sectionWork.id}-title`}>
          <SectionHeading id={`${sectionWork.id}-title`} eyebrow="Track record" title={sectionWork.title} />
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <Html html={sectionWork.html} className={PROSE_CARD} />
          </div>
        </Band>
      )}

      {/* ── 7. Process steps ─────────────────────────────────────────────── */}
      <Band id="how-a-client-introduction-becomes-an-assignment" labelledBy="advisers-process-title">
        <SectionHeading
          id="advisers-process-title"
          eyebrow="Working together"
          title="How a client introduction becomes an assignment"
        />
        <div className="mt-8">
          <StepCards steps={PROCESS_STEPS} />
        </div>
      </Band>

      {/* ── 8. WhatsApp community ────────────────────────────────────────── */}
      {sectionCommunity && (
        <Band id={sectionCommunity.id} tone="navy" labelledBy={`${sectionCommunity.id}-title`}>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
              <SectionHeading id={`${sectionCommunity.id}-title`} tone="dark" eyebrow="Stay informed" title={sectionCommunity.title} />
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${BTN_LIME} w-fit`}>
                <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Join the WhatsApp community</span>
              </a>
            </div>
            <div className="text-base leading-8 text-white/85 [&_a]:text-[#eaff6b]! [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white! [&_h3:first-child]:mt-0 [&_hr]:my-6 [&_hr]:border-white/20 [&_p]:m-0 [&_p+p]:mt-2">
              <Html html={sectionCommunity.html} />
            </div>
          </div>
        </Band>
      )}

      {/* Community invitations (separate from private WhatsApp contact and from the partnership journey) */}
      {community && <Band className="py-10 lg:py-14">{community}</Band>}

      {/* ── 9. Partnership ───────────────────────────────────────────────── */}
      {sectionPartnership && (
        <Band id={sectionPartnership.id} tone="grey" labelledBy={`${sectionPartnership.id}-title`}>
          <SectionHeading
            id={`${sectionPartnership.id}-title`}
            eyebrow="Partnership"
            title={sectionPartnership.title}
            intro="Three commitments that define how Rapid works with every adviser."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PARTNERSHIP_PRINCIPLES.map(({ num, title, body }) => (
              <article key={num} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-[#09263e] text-sm font-bold text-[#eaff6b]">
                  {num}
                </span>
                <h3 className={H3_CLASS}>{title}</h3>
                <p className="m-0! text-[15px] leading-7 text-slate-700">{body}</p>
              </article>
            ))}
          </div>

          {/* CMS disclaimer / additional partnership text */}
          {sectionPartnership.html && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white px-6 py-5 text-sm leading-6 text-slate-600 [&_a]:font-semibold [&_a]:text-[#1f5d57] [&_a:hover]:underline [&_h3]:hidden [&_p]:m-0 [&_p+p]:mt-2">
              <Html html={sectionPartnership.html} />
            </div>
          )}
        </Band>
      )}

      {/* ── 10. Contact form ─────────────────────────────────────────────── */}
      {sectionCTA && (
        <Band id={sectionCTA.id} labelledBy={`${sectionCTA.id}-title`}>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading id={`${sectionCTA.id}-title`} eyebrow="Get in touch" title={sectionCTA.title} />
            <Html html={sectionCTA.html} className="mt-4 text-base leading-7 text-slate-700 [&_p]:m-0 [&_p+p]:mt-2" />
          </div>
          <div className="mt-8">
            <ContactExperience pageTitle={page.h1} pageId={page.id} variant="section" />
          </div>
        </Band>
      )}
    </main>
  );
}
