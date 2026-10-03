
import Image from "next/image";
import {
  Users,
  Building2,
  Briefcase,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Html } from "@/components/pages/content-primitives";
import { ContactExperience } from "@/components/form/contact-experience";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";

const DEFAULT_IMAGE = "/assets/hero-section.jpg";
const WHATSAPP_URL  = "https://wa.me/919254049513";

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
    num: "01",
    title: "Start with a short introduction",
    body: "Share your role, the client's activity, district, project stage and requirement. Agree who should join the first discussion.",
  },
  {
    num: "02",
    title: "Define the work together",
    body: "Rapid discusses the requirement and identifies its proposed role — scope, fees, client-contact arrangements, responsibilities and communications.",
  },
  {
    num: "03",
    title: "Move the work forward",
    body: "The business and advisers provide records within their responsibility. Rapid undertakes the agreed documentation, coordination and follow-ups.",
  },
];

const SERVICES = [
  { label: "Subsidies & Incentives",    href: "/en/p/S01" },
  { label: "Statutory Approvals",       href: "/en/p/S02" },
  { label: "Licences & Certifications", href: "/en/p/S03" },
  { label: "Industrial Insurance",      href: "/en/p/S04" },
  { label: "Finance & Other Services",  href: "/en/p/S05" },
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

/* ─── Component ────────────────────────────────────────────────────────────── */

export function AdvisersPage({ page, t, has, image = DEFAULT_IMAGE }) {
  const byId = Object.fromEntries((page.sections ?? []).map((s) => [s.id, s]));

  const sectionTool        = byId["start-with-a-useful-tool"];
  const sectionWork        = byId["see-the-work-and-meet-the-people"];
  const sectionCommunity   = byId["explore-the-whatsapp-community"];
  const sectionPartnership = byId["explore-a-partnership-with-rapid"];
  const sectionCTA         = byId["discuss-working-together"];

  return (
    <main id="main">

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <Section className="py-12 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Left — content */}
          <div className="order-2 flex flex-col gap-7 lg:order-1">
            <Heading
              className="text-start"
              eyebrow="For Advisers"
              heading={page.h1}
              headingClassName="mt-3 text-[2.2rem] font-extrabold leading-[1.15] tracking-tight text-[#09263e] text-wrap-balance lg:text-[2.7rem]"
              subheading={page.introHtml}
              subheadingClassName="mt-4 max-w-lg text-base leading-8 text-slate-600 [&_p]:m-0 [&_p+p]:mt-3"
            />

            <div className="flex flex-wrap gap-3">
              <a
                href="#discuss-working-together"
                className="inline-flex items-center gap-2 rounded-full text-white! bg-[#09263e] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                <span>Discuss working together</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#start-with-a-useful-tool"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-[#09263e] transition-colors hover:bg-slate-50"
              >
                <span>6-question client tool</span>
              </a>
            </div>
          </div>

          {/* Right — image */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <Image
              src={page.image || image}
              alt={page.h1}
              width={600}
              height={600}
              className="h-auto w-full max-w-xl rounded-3xl object-cover shadow-md"
              priority
            />
          </div>
        </div>
      </Section>

      {/* ── 2. Audience cards ────────────────────────────────────────────── */}
      <Section
        id="more-value-for-the-people-who-trust-your-advice"
        className="  bg-gray-50"
      >
        <Heading
          className="mb-10 text-start"
          eyebrow="Who this is for"
          heading="More value for the people who trust your advice"
          headingClassName="mt-2 text-2xl font-extrabold text-[#09263e] lg:text-3xl"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, blurb, cta }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-7 shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold text-[#09263e]">{title}</h3>
              <p className="flex-1 text-sm leading-7 text-slate-600">{blurb}</p>
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
                <strong className="font-semibold text-[#1f5d57]">Put it to work: </strong>
                {cta}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. 6-question client tool ─────────────────────────────────────── */}
      {sectionTool && (
        <Section id={sectionTool.id} className="py-14 lg:py-20">
          <div className="mx-auto  rounded-3xl bg-[#09263e] px-8 py-10 lg:px-12 lg:py-14">
            <Heading
              className="mb-8 text-start  text-white"
              eyebrow="Practical tool"
              eyebrowClassName="mb-3 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
              heading={sectionTool.title}
              headingClassName="text-2xl  font-extrabold text-white! lg:text-3xl"
            />
            <div className="text-sm leading-8 max-w-5xl  text-slate-300 [&_a]:font-semibold [&_a]:text-[#eaff6b]! [&_a:hover]:underline [&_ol]:mt-4 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-3 [&_li]:rounded-xl [&_li]:bg-white/10 [&_li]:px-5 [&_li]:py-3 [&_li]:text-white [&_strong]:text-[#eaff6b] [&_p]:m-0 [&_p+p]:mt-4">
              <Html html={sectionTool.html}  className="props-a:text-white!" />
            </div>
          </div>
        </Section>
      )}

      {/* ── 4. Preview scenarios — 3 styled cards ────────────────────────── */}
      <Section
        id="a-preview-of-useful-updates"
        className="pt-0 pb-16 lg:pb-20 bg-slate-50"
      >
        <Heading
          className="mb-10 text-start"
          eyebrow="Community content preview"
          heading="A preview of useful updates"
          headingClassName="mt-2 text-2xl font-extrabold text-[#09263e] lg:text-3xl"
          subheading="Examples of the kind of updates members receive."
          subheadingClassName="mt-3 text-base text-slate-600"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {PREVIEW_SCENARIOS.map(({ who, ask, use }) => (
            <div
              key={who}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Card header */}
              <div className="border-b border-slate-100 bg-[#09263e]/5 px-6 py-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1f5d57]">
                  {who}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 px-6 py-5">
                {/* Ask */}
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Ask
                  </p>
                  <p className="text-sm leading-6 text-[#09263e]">{ask}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-slate-200" />

                {/* How Rapid helps */}
                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-[#1f5d57]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      How Rapid helps
                    </p>
                    <p className="text-sm leading-6 text-slate-600">{use}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 5. Services ──────────────────────────────────────────────────── */}
      <Section
        id="specialist-support-for-your-clients-next-step"
        className="py-14 lg:py-20"
      >
        <Heading
          className="mb-8 text-start"
          eyebrow="Rapid's expertise"
          heading="Specialist support for your client's next step"
          headingClassName="mt-2 text-2xl font-extrabold text-[#09263e] lg:text-3xl"
        />
        <div className="flex flex-wrap gap-3">
          {SERVICES.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-[#09263e]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#09263e] shadow-sm transition-colors hover:bg-[#09263e] hover:text-white"
            >
              <span>{label}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          ))}
        </div>
      </Section>

      {/* ── 6. Work proof ────────────────────────────────────────────────── */}
      {sectionWork && (
        <Section id={sectionWork.id} className="py-14 lg:py-20 bg-slate-50">
          <Heading
            className="mb-8 text-start"
            eyebrow="Track record"
            heading={sectionWork.title}
            headingClassName="mt-2 text-2xl font-extrabold text-[#09263e] lg:text-3xl"
          />
          <div className="text-sm leading-8 text-slate-600 [&_a]:font-medium [&_a]:text-[#1f5d57] [&_a:hover]:underline [&_p]:m-0 [&_p+p]:mt-3">
            <Html html={sectionWork.html} />
          </div>
        </Section>
      )}

      {/* ── 7. Process steps ─────────────────────────────────────────────── */}
      <Section
        id="how-a-client-introduction-becomes-an-assignment"
        className="py-14 lg:py-20"
      >
        <Heading
          className="mb-10 text-start"
          eyebrow="Working together"
          heading="How a client introduction becomes an assignment"
          headingClassName="mt-2 text-2xl font-extrabold text-[#09263e] lg:text-3xl"
        />
        <ol className="grid gap-6 md:grid-cols-3">
          {PROCESS_STEPS.map(({ num, title, body }) => (
            <li
              key={num}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-7 shadow-sm"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-[#eaff6b] text-sm font-black text-[#09263e]">
                {num}
              </span>
              <h3 className="text-base font-bold text-[#09263e]">{title}</h3>
              <p className="text-sm leading-7 text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── 8. WhatsApp community — dark panel ───────────────────────────── */}
      {sectionCommunity && (
        <Section id={sectionCommunity.id} className="py-14 lg:py-20 bg-[#09263e]">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

            {/* Left — heading + cta */}
            <div className="flex flex-col gap-6">
          <div className=" sticky top-35">    <Heading
                className="text-start "
                eyebrow="Stay informed"
                eyebrowClassName="mb-2   inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#eaff6b]"
                heading={sectionCommunity.title}
                headingClassName="text-2xl font-extrabold text-white! lg:text-3xl"
              />

              {/* WhatsApp button — yellow bg, dark text — always visible */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2.5 rounded-full bg-[#eaff6b] px-6 py-3 text-sm font-bold text-[#09263e] transition-opacity hover:opacity-90"
              >
                <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Join the WhatsApp community</span>
              </a>
            </div>
</div>
            {/* Right — html content */}
            <div className="text-sm leading-8 text-slate-300! [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-white! [&_h3:first-child]:mt-0 [&_hr]:my-6 [&_hr]:border-white/20 [&_p]:m-0 [&_p+p]:mt-2">
              <Html html={sectionCommunity.html} />
            </div>
          </div>
        </Section>
      )}

      {/* ── 9. Partnership — 3 principle cards ───────────────────────────── */}
      {sectionPartnership && (
        <Section id={sectionPartnership.id} className="py-14 lg:py-20 bg-slate-50">
          <Heading
            className="mb-10 text-start"
            eyebrow="Partnership"
            heading={sectionPartnership.title}
            headingClassName="mt-2 text-2xl font-extrabold text-[#09263e] lg:text-3xl"
            subheading="Three commitments that define how Rapid works with every adviser."
            subheadingClassName="mt-3 text-base text-slate-600"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {PARTNERSHIP_PRINCIPLES.map(({ num, title, body }) => (
              <div
                key={num}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#09263e] text-xs font-black text-[#eaff6b]">
                  {num}
                </span>
                <h3 className="text-base font-bold text-[#09263e]">{title}</h3>
                <p className="text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          {/* CMS disclaimer / additional partnership text */}
          {sectionPartnership.html && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white px-6 py-5 text-xs leading-6 text-slate-500 [&_a]:font-medium [&_a]:text-[#1f5d57] [&_a:hover]:underline [&_h3]:hidden [&_p]:m-0 [&_p+p]:mt-2">
              <Html html={sectionPartnership.html} />
            </div>
          )}
        </Section>
      )}

      {/* ── 10. CTA / Contact form ────────────────────────────────────────── */}
      {sectionCTA && (
    
       <Section className="px-0 "> <Heading
              className="mb-8 text-center  max-w-5xl mx-auto"
              eyebrow="Get in touch"
              heading={sectionCTA.title}
              headingClassName="mt-2 text-2xl font-extrabold text-[#09263e] lg:text-3xl"
              subheading={sectionCTA.html}
              subheadingClassName="mt-3 text-base leading-8 text-slate-600 [&_p]:m-0 [&_p+p]:mt-2"
            />

            <ContactExperience pageTitle={page.h1} pageId={page.id} variant="section" />
</Section>     )}

    </main>
  );
}