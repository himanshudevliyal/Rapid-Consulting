// seeders/20261029100002-seed-figma-hubs-2.js
// Round 3, batch 2 (29 October 2026): the rest of the Figma hubs and the first
// situation page, built with the page builder.
//
//   subsidies               NEW hub at /subsidies (Figma 1209-51699, S01).
//   finance-and-insurance   the Round-2 hub restyled to the Figma layout (1253-55461).
//   approvals               the Approvals hub (seeded by 20261029100001) gets the
//                           closing enquiry panel; created here when it is missing.
//                           APPROVALS_HUB_PATH still overrides the path.
//   your-project            small update to the Your Project hub: the logo strip
//                           after the hero, the "Setting up" stage's second button
//                           now opens /your-project/setting-up, and the closing
//                           form becomes the closing enquiry panel.
//   your-project/setting-up NEW situation page "Setting up a new unit"
//                           (Figma 1642-93997): masthead with a video card, a side
//                           rail form, quick answers, sample case tiles, the
//                           route, "what you may hear", the roadmap, loan and
//                           subsidy, getting started, services, FAQs.
//   Setting "navigation"    if it is still exactly the Round-2 default, Approvals
//                           now leads to /approvals and Subsidies to /subsidies.
//
// Copy. The Figma wireframe text (Rapid-approved) is used word for word where
// the spec gives it. Where the spec stops ("Fire and ... subsidy", the loan
// section, the closing forms, the quick answers ...) the wording is neutral
// text draft copy: no outcome, timing or fee promises, no figures. It is
// marked "draft copy" below and needs Rapid's approval before it is
// relied on. Case tiles on the situation page are SAMPLES and say so on the page.
// The 95% seal and its footnote come from the design; the footnote says the
// definition, period and file count are awaiting confirmation.
//
// Links go only to pages that exist: service pages (slugs from
// seeders/data/rapid-services.json), published scheme pages (slugs the website
// uses, from seeders/data/rapid-site-content.json) and the scheme directory's
// own address contract (/schemes?q=..., /schemes?topic=...). A card or row for
// something with no page of its own has no link.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100002-seed-figma-hubs-2
//
// Run seeders 20261024100001 and 20261029100001 first. Safe to run again, and it
// never overwrites an editor's work:
//   - a page that is still exactly as first seeded (version 1, one revision) is
//     replaced and published as the next version;
//   - a page that has been edited is left alone; the new layout is added to its
//     revision history ("Figma layout 2 ...") so an editor can restore it from
//     the revisions drawer;
//   - a page already handled by this seeder is skipped.
// After running, save or publish a page in the dashboard (or wait for the
// website's revalidate interval) to refresh the website cache.

import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { makeSection, normaliseSections } from "../app/helpers/site-page-registry.js";
import {
  FAQ_CALLBACK,
  FAQ_GUARANTEE,
  FAQ_READY,
  PAGE as LINKS,
  approvalsPage,
  card,
  link,
  needs,
  mistake,
  serviceFaq,
  stage,
} from "./20261029100001-seed-figma-hubs.js";

const APPROVALS_HUB_PATH = process.env.APPROVALS_HUB_PATH || "approvals";

const siteContent = JSON.parse(
  fs.readFileSync(new URL("./data/rapid-site-content.json", import.meta.url), "utf8"),
);
const services = JSON.parse(
  fs.readFileSync(new URL("./data/rapid-services.json", import.meta.url), "utf8"),
);

// Revision notes double as markers, so a second run recognises its own work.
const NOTE_INITIAL = "Figma hub layout 2 (seeded)";
const NOTE_REPLACED = "Figma layout 2 (seeded, replaces the first seeded sections)";
const NOTE_PROPOSED = "Figma layout 2 (seeded). Restore this revision to use it";
const NOTE_PATCHED = "Figma layout 2 (seeded): logo strip, Setting up link and closing panel added";
const NOTE_PATCH_PROPOSED = "Figma layout 2 (seeded). Restore this revision to add the logo strip, the Setting up link and the closing panel";
const MARKERS = [NOTE_INITIAL, NOTE_REPLACED, NOTE_PROPOSED, NOTE_PATCHED, NOTE_PATCH_PROPOSED];

// ── Links (only pages that exist) ─────────────────────────────────────────

const L = {
  ...LINKS,
  collateralFree: link("D087"),
  projectFinance: link("D088"),
  workingCapital: link("D091"),
  equipmentLoan: link("D090"),
  industrialInsurance: link("D083"),
  insuranceClaims: link("D084"),
  financeFamily: link("S05"),
};

// Published scheme pages (the slugs the website serves).
const SCHEME = {
  hguvy: "/schemes/hguvy-scheme",
  stampDuty: "/schemes/stamp-duty-reimbursement",
  testing: "/schemes/testing-machine-subsidy",
  fire: "/schemes/fire-equipment-subsidy",
  sgst: "/schemes/sgst-refund-subsidy",
  electricity: "/schemes/electricity-duty-exemption",
  employment: "/schemes/employment-generation-scheme",
  cgtmse: "/schemes/cgtsme-fee-refund-scheme",
  padmaInterest: "/schemes/padma-interest-subsidy-scheme",
  padmaCluster: "/schemes/padma-cluster-infrastructure-development-scheme",
  food: "/schemes/food-processing-industries-scheme",
  aif: "/schemes/agricultural-infrastructure-fund-aif",
  ahidf: "/schemes/animal-husbandry-infrastructure-development-fund-ahidf",
  nhb: "/schemes/nhb-scheme",
};

// The scheme directory's own address contract (scheme-directory.jsx).
const DIRECTORY = "/schemes";
const directoryTopic = (topic) =>
  `/schemes?topic=${topic
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")}`;
const TOPIC = {
  investment: directoryTopic("Investment & finance"),
  quality: directoryTopic("Quality, technology & research"),
  exports: directoryTopic("Exports & market access"),
};

// Real FAQ items of a service's English page, picked by question, word for word.
const pickFaq = (code, ...questions) =>
  serviceFaq(code).filter((item) => questions.includes(item.question));

// ── Builders ──────────────────────────────────────────────────────────────

// Hero with the choice card as icon rows that scroll to a section.
const hubHero = ({ eyebrow, heading, intro, highlights, footnote, cardTitle, rows, navLabel }) =>
  makeSection("masthead", {
    variant: "hero",
    anchor: "hero",
    data: {
      eyebrow,
      heading,
      intro_html: `<p>${intro}</p>`,
      primary_cta_label: "Discuss your project",
      show_whatsapp: true,
      highlights: highlights.map(([title, text]) => ({ title, text })),
      footnote,
      card_title: cardTitle,
      seal_value: "95%",
      seal_label: "Success rate*",
      card_style: "icons",
      card_items: rows.map(([title, text, target, icon]) => ({ title, text, target, href: "", icon })),
      nav_label: navLabel,
    },
  });

const FOOTNOTE = "*Across all services. Success definition, period and file count awaiting confirmation.";

const section = ({ anchor, label, ...rest }) => ({ anchor, label, ...rest });

// The closing enquiry panel at the foot of a hub.
const closing = ({ heading, intro, title, hint, selectLabel, options, placeholder, activityLabel, submit, helper, source, seal = true, photoNote }) =>
  makeSection("closing_panel", {
    anchor: "enquiry-form",
    data: {
      eyebrow: "",
      heading,
      intro,
      photo_note: photoNote ?? "Placeholder - final photography to be supplied by Rapid",
      form_title: title,
      form_hint: hint ?? "",
      show_seal: seal,
      select_label: selectLabel ?? "",
      select_required: false,
      select_placeholder: placeholder ?? "",
      select_options: (options ?? []).map((text) => ({ text })),
      show_district: true,
      show_activity: true,
      activity_label: activityLabel ?? "",
      submit_label: submit,
      helper,
      source,
    },
  });

const STAGE_OPTIONS = ["Buying land", "Setting up", "Running", "Expanding", "File stuck"];

// ── Subsidies hub ─────────────────────────────────────────────────────────

const subsidiesPage = ({ cases = [] } = {}) => ({
  page_key: "pg_hubsubsidies",
  template: "hub",
  locale: "en",
  path: "subsidies",
  title: "Subsidies",
  h1: "Eligible for a subsidy? One planning mistake can make you ineligible.",
  meta_title: "Subsidies and incentives for factories in Haryana | Rapid Consulting",
  meta_description:
    "Know which Haryana schemes fit your factory, and what to do before you invest: subsidies on your investment, on your loan, while you run and for your sector.",
  sections: [
    hubHero({
      eyebrow: "Subsidies & incentives",
      heading: "Eligible for a subsidy? One planning mistake can make you ineligible.",
      intro: "Know which Haryana schemes fit your factory, and what to do before you invest.",
      highlights: [
        ["The right scheme for each cost.", "And the date to apply."],
        ["Followed through to payment.", "We stay with the claim until it's paid."],
        ["Your first check is free.", "In writing, with the policy and the date it rests on."],
      ],
      footnote: FOOTNOTE,
      cardTitle: "Subsidies by what they pay back",
      rows: [
        ["On your investment", "Capital, stamp duty and equipment", "on-your-investment", "investment"],
        ["On your loan", "Interest and the CGTMSE fee", "on-your-loan", "loan"],
        ["While you run", "SGST, power, jobs and certification", "while-you-run", "running"],
        ["For your sector", "Food and agri, textile, warehousing and clusters", "for-your-sector", "sector"],
      ],
      navLabel: "Find your subsidy:",
    }),

    stage({
      anchor: "on-your-investment",
      label: "On your investment",
      eyebrow: "On your investment",
      title: "Claim back part of what you build and buy.",
      body: "These subsidies return a share of your spending on land, buildings and machinery. Most are decided before the money goes out, so the check has to come first.",
      kind: "needs",
      sideTitle: "You may qualify if",
      sideItems: [
        needs("You're setting up or expanding, with investment in building and machinery", "Capital investment subsidy", TOPIC.investment),
        needs("You're about to register land for the unit", "Stamp duty refund (check before the registry)", SCHEME.stampDuty),
        needs("You're setting up a small unit in rural Haryana", "HGUVY", SCHEME.hguvy),
        needs("You're buying testing, fire-safety or pollution-control equipment", "Equipment subsidy (talk to us before you order)", "/schemes?q=equipment"),
      ],
      cards: [
        card("Capital investment subsidy", "Investing in the unit? Claim on the eligible investment.", TOPIC.investment),
        card("Stamp duty refund", "Registering land? Check the refund before the registry.", SCHEME.stampDuty),
        card("HGUVY", "Small unit in rural Haryana? Check if your location fits.", SCHEME.hguvy),
        card("Testing equipment subsidy", "Buying testing machines? Check the window first.", SCHEME.testing),
        // draft copy: the spec cuts this card off ("Fire and ... subsidy").
        card("Fire and safety equipment subsidy", "Buying fire-safety equipment? Check the conditions first.", SCHEME.fire),
      ],
      cta: "Check before I invest",
      preset: "subsidies-investment",
    }),

    // draft copy (the spec asks for neutral copy here).
    stage({
      anchor: "on-your-loan",
      label: "On your loan",
      eyebrow: "On your loan",
      title: "Support on the loan, not only on what you buy.",
      body: "Some schemes support the interest on a term loan, and some refund the guarantee fee on a collateral-free loan. Whether one applies depends on the scheme's conditions, your lender and the dates, so check before the loan is sanctioned.",
      kind: "needs",
      sideTitle: "You may qualify if",
      sideItems: [
        needs("You're borrowing to set up or expand", "Interest subsidy (PADMA)", SCHEME.padmaInterest),
        needs("You're taking a collateral-free loan", "CGTMSE fee refund", SCHEME.cgtmse),
        needs("You want the loan and the subsidy planned on one report", "Project finance", L.projectFinance),
      ],
      cards: [
        card("Interest subsidy", "Borrowing to set up or expand? Check whether interest support applies.", SCHEME.padmaInterest),
        card("CGTMSE fee refund", "Taking a collateral-free loan? Check the fee refund.", SCHEME.cgtmse),
        card("Collateral-free loans", "Short of collateral? Check whether this route fits.", L.collateralFree),
        card("Project finance", "Need one report for the bank and the scheme? Plan them together.", L.projectFinance),
      ],
      cta: "Check my loan subsidy",
      preset: "subsidies-loan",
    }),

    stage({
      anchor: "while-you-run",
      label: "While you run",
      eyebrow: "While you run",
      title: "Claims you can make once production starts.",
      body: "From then on, you can claim on the SGST you pay, your power bills, the people you hire and the certificates you earn. Some claims repeat every year; others are made once. Each has its own window, and a missed one can mean losing the benefit.",
      tone: "navy",
      kind: "needs",
      sideTitle: "You may qualify if",
      sideItems: [
        needs("You've started production and pay SGST", "Net SGST reimbursement", SCHEME.sgst),
        needs("Your unit has a new power connection", "Electricity duty exemption", SCHEME.electricity),
        needs("You employ local workers", "Employment generation subsidy", SCHEME.employment),
        needs("You've done ISO, ZED, a patent or an energy audit", "Certification and patent reimbursement", TOPIC.quality),
        needs("You export", "Export assistance", TOPIC.exports),
      ],
      cards: [
        card("Net SGST reimbursement", "Paying SGST since production began? Check the claim window.", SCHEME.sgst),
        card("Electricity duty exemption", "New power connection? Check the exemption.", SCHEME.electricity),
        card("Employment generation subsidy", "Hiring local workers? Check the claim conditions.", SCHEME.employment),
        card("Certification and patent reimbursement", "ISO, ZED or a patent? Check what can be claimed.", TOPIC.quality),
        // draft copy: the spec cuts this card off ("Industrial ...").
        card("Export assistance", "Selling outside India? Check the assistance available.", TOPIC.exports),
      ],
      cta: "Check what I can claim",
      preset: "subsidies-running",
    }),

    // Heading and text draft copy (the spec gives the side card and the cards only).
    stage({
      anchor: "for-your-sector",
      label: "For your sector",
      eyebrow: "For your sector",
      title: "Schemes written for your kind of unit.",
      body: "Food and agri units, textile units, warehouses and clusters each have schemes of their own, and some sit alongside the general ones. Start from your sector to see what is worth checking together.",
      kind: "needs",
      sideTitle: "You may qualify if",
      sideItems: [
        needs("You run or plan a food or agro processing unit", "Food processing incentives", SCHEME.food),
        needs("You plan a warehouse or cold storage", "Agriculture Infrastructure Fund (AIF)", SCHEME.aif),
        needs("You plan a dairy, meat or feed unit", "AHIDF", SCHEME.ahidf),
        needs("You're an association planning a common facility", "PADMA and cluster schemes", SCHEME.padmaCluster),
      ],
      cards: [
        card("Food processing incentives", "Food unit? See every benefit that fits, together.", SCHEME.food),
        card("Agriculture Infrastructure Fund (AIF)", "Warehouse or cold storage? Get interest support on the loan.", SCHEME.aif),
        card("PMFME", "Small food unit? Check the central scheme first."),
        card("AHIDF", "Dairy, meat or feed unit? Check the infrastructure fund.", SCHEME.ahidf),
        card("NHB assistance", "Horticulture project? Check the board's assistance.", SCHEME.nhb),
      ],
      cta: "See schemes for my industry",
      preset: "subsidies-sector",
    }),

    makeSection("scheme_search", {
      label: "Search",
      anchor: "search",
      data: {
        eyebrow: "Find a subsidy",
        heading: "Know the scheme's name? Search for it.",
        intro: "",
        search_label: "Search by subsidy, scheme or expense",
        placeholder: "CGTMSE, AIF, stamp duty, machinery",
        button_label: "Search",
        chips: [
          { label: "All", term: "", topic: "", href: DIRECTORY },
          { label: "On your investment", term: "", topic: "", href: "#on-your-investment" },
          { label: "On your loan", term: "", topic: "", href: "#on-your-loan" },
          { label: "While you run", term: "", topic: "", href: "#while-you-run" },
          { label: "For your sector", term: "", topic: "", href: "#for-your-sector" },
        ],
      },
    }),

    makeSection("timeline_steps", {
      anchor: "from-eligibility-to-payment",
      data: {
        eyebrow: "From eligibility to payment",
        heading: "When the money actually arrives.",
        intro: "",
        items: [
          { title: "Eligibility and route", text: "Settled first: which costs count, and from when." },
          {
            title: "Application",
            text: "Filed with the eligible investment documented: invoices, payment proof and the CA's certificate.",
          },
          { title: "Sanction", text: "The department approves the amount. This isn't payment yet." },
          { title: "Disbursement", text: "Payment is released, often after an inspection." },
        ],
        highlight_last: true,
        cta_label: "Check my eligibility",
        cta_preset: "subsidies-eligibility",
      },
    }),

    ...(cases.length
      ? [
          makeSection("linked_cases", {
            variant: "carousel",
            anchor: "client-success",
            data: {
              heading: "Subsidies we've handled for businesses like yours.",
              intro: "",
              records: cases,
              view_all_href: "/case-studies",
            },
          }),
        ]
      : []),

    makeSection("mistakes_claim", {
      label: "Where subsidies get lost",
      anchor: "where-subsidies-get-lost",
      data: {
        eyebrow: "Where subsidies get lost",
        heading: "The question isn't how much you'll get. It's which route you're on.",
        mistakes_title: "Common mistakes",
        mistakes: [
          { text: "Ordering the machine before checking the scheme rules." },
          { text: "Investing through a company that doesn't qualify." },
          { text: "Claiming two schemes on the same cost." },
          { text: "A project report that shows the subsidy wrongly, so the bank or the scheme turns it down." },
        ],
        claim_title: "Claim stuck?",
        claim_text:
          "Send us the application or claim number and the latest letter or query. We'll tell you what's holding it and what can be done.",
        claim_cta_label: "Get my claim reviewed",
        claim_cta_preset: "subsidy-claim-stuck",
      },
    }),

    makeSection("reviews_carousel", { anchor: "client-experiences", data: {} }),

    makeSection("faq", {
      label: "FAQs",
      anchor: "faqs",
      data: {
        heading: "Questions about subsidies.",
        items: [...serviceFaq("S01"), FAQ_GUARANTEE],
      },
    }),

    // draft copy, needs Rapid approval.
    closing({
      heading: "Tell us what you plan to build or buy.",
      intro:
        "Share a few details and an expert consultant from Rapid will call you back to see which schemes may apply. The first check is on us.",
      title: "Get your free subsidy check.",
      selectLabel: "What are you planning?",
      options: [
        "Setting up a new unit",
        "Expanding a unit",
        "Buying machinery or equipment",
        "Taking or planning a loan",
        "A claim is stuck",
        "Not sure yet",
      ],
      placeholder: "Choose one",
      activityLabel: "Your project",
      submit: "Get my subsidy check",
      helper: "A Rapid expert will call you.",
      source: "hub-subsidies",
    }),
  ],
});

// ── Finance and insurance hub ─────────────────────────────────────────────

const financePage = () => ({
  page_key: "pg_hubfinance",
  template: "hub",
  locale: "en",
  path: "finance-and-insurance",
  title: "Finance and insurance",
  h1: "The wrong report can cost you the subsidy. The wrong cover, the claim.",
  meta_title: "Finance and insurance | Rapid Consulting",
  meta_description:
    "Project finance and industrial insurance for factories in Haryana, from the first report to the last claim.",
  sections: [
    hubHero({
      eyebrow: "Finance & insurance",
      heading: "The wrong report can cost you the subsidy. The wrong cover, the claim.",
      intro: "Project finance and industrial insurance for factories in Haryana, from the first report to the last claim.",
      highlights: [
        ["Loan and subsidy planned together.", "One project report the bank and the scheme both accept."],
        ["Claims followed through.", "We stay with a claim until it's settled."],
        ["Your first check is free.", "It shows what you need to fund and cover, and what you don't."],
      ],
      footnote: FOOTNOTE,
      cardTitle: "Find what you need",
      rows: [
        ["Finance for your project", "Project report, loans and collateral-free credit", "finance", "finance"],
        ["Insurance for your plant", "Cover, renewals and claims", "insurance", "insurance"],
      ],
      navLabel: "Find what you need:",
    }),

    stage({
      anchor: "finance",
      label: "Finance",
      eyebrow: "Finance",
      title: "Get the money in place before the bills come in.",
      body: "The bank checks whether the project can repay; the scheme checks which costs qualify. A report written for only one of them fails the other. We prepare the project report, structure the credit and work with your bank until the loan is sanctioned.",
      kind: "needs",
      sideTitle: "You may need this if",
      sideItems: [
        needs("You're setting up or expanding", "Project report (DPR), Project finance", L.projectFinance),
        needs("You're buying machinery", "Equipment loans", L.equipmentLoan),
        needs("Cash is tied up in stock and customer credit", "Working capital", L.workingCapital),
        needs("You have little or no collateral", "Collateral-free loans (CGTMSE)", L.collateralFree),
        needs("You're deciding how much to put in yourself", "Promoter and project funding"),
      ],
      cards: [
        card("Project report (DPR)", "Need a project report? Ready for the bank, the scheme or investors."),
        card("Project finance", "New unit or expansion? Prepare your funding proposal.", L.projectFinance),
        card("Equipment loans", "Buying machinery? Fund it without hurting the subsidy.", L.equipmentLoan),
        card("Working capital", "Waiting on customer payments? Plan your cash-flow funding.", L.workingCapital),
        card("Collateral-free loans", "Short of collateral? Check whether this route fits.", L.collateralFree),
      ],
      cta: "Plan my project finance",
      preset: "finance-project",
    }),

    // Heading, text and side card draft copy (the spec gives the cards and the button).
    stage({
      anchor: "insurance",
      label: "Insurance",
      eyebrow: "Insurance",
      title: "Keep the plant covered, and the cover current.",
      body: "A policy that was right on the day it began can fall behind the plant: machinery and stock are added, values change, renewals come round. When there is a loss, the claim rests on what the policy and your records show.",
      tone: "navy",
      kind: "needs",
      sideTitle: "You may need this if",
      sideItems: [
        needs("You have a plant, machinery or stock to insure", "Industrial insurance", L.industrialInsurance),
        needs("You've added machinery or stock since the policy began", "Update the cover", L.industrialInsurance),
        needs("You've had a loss", "Insurance claims", L.insuranceClaims),
        needs("You want to know if the premium can be supported", "Premium support"),
      ],
      cards: [
        card("Industrial insurance", "Plant insured? The right cover, every year.", L.industrialInsurance),
        card("Add machinery or stock", "Added machinery or stock? Get it on the policy now.", L.industrialInsurance),
        card("Insurance claims", "Had a loss? Get help with your claim.", L.insuranceClaims),
        card("Premium support", "Plant insured? Claim support on the premium."),
      ],
      cta: "Review my cover",
      preset: "finance-insurance",
    }),

    makeSection("mistakes_claim", {
      label: "Where money is lost",
      anchor: "where-money-is-lost",
      data: {
        eyebrow: "Where money is lost",
        heading: "The costly mistakes happen before you reach the bank, and after you buy the policy.",
        mistakes_title: "Common mistakes",
        mistakes: [
          { text: "Ordering machinery before the loan is sanctioned." },
          { text: "Pledging property when a collateral-free route might have fitted." },
          { text: "Adding a machine without updating the insurance." },
        ],
        claim_title: "Claim delayed or rejected?",
        claim_text:
          "Send us the policy, the claim number and the insurer's last letter. We'll tell you what's holding it and what can be done.",
        claim_cta_label: "Get my claim reviewed",
        claim_cta_preset: "insurance-claim-review",
      },
    }),

    makeSection("reviews_carousel", { anchor: "client-experiences", data: {} }),

    // Real answers from the service pages (word for word). The spec's three
    // questions ("What does a bank-ready project report include?", "Can I get a
    // loan without collateral?", "How much should my plant be insured for?") have
    // no approved answers yet, so the nearest approved service FAQs are used.
    makeSection("faq", {
      label: "FAQs",
      anchor: "faqs",
      data: {
        heading: "Common questions about finance and insurance",
        items: [
          ...pickFaq("S05", "Do we need a project report before calling?", "Does collateral-free mean no scrutiny?", "Can subsidies be considered with finance?"),
          ...pickFaq("D083", "Can we insure additional machinery midway through a policy?"),
          ...pickFaq("D084", "Does the sum insured equal the payout?"),
          FAQ_GUARANTEE,
        ],
      },
    }),

    closing({
      heading: "Not sure where to start?",
      intro: "",
      photoNote: "Placeholder: a factory site in Haryana. Licensed or commissioned, labelled as representative.",
      title: "Get your next steps.",
      selectLabel: "What do you need",
      options: ["Project finance", "Equipment loan", "Working capital", "Industrial insurance", "An insurance claim"],
      placeholder: "Not sure yet",
      activityLabel: "Your unit",
      submit: "Get my next steps",
      helper: "A Rapid expert will call you.",
      source: "hub-finance",
      seal: false,
    }),
  ],
});

// ── Approvals hub (the one 20261029100001 holds, plus the closing panel) ───

const approvalsHub = () => {
  const page = approvalsPage(APPROVALS_HUB_PATH);
  const sections = page.sections.map((entry) =>
    entry.type === "enquiry_form"
      ? closing({
          heading: "Tell us about your plot or your unit.",
          intro:
            "Share a few details and an expert consultant from Rapid will call you back to see which approvals may apply. The first check is on us.",
          title: "Get your free approvals check.",
          selectLabel: "What do you need?",
          options: [
            "Land and site approvals",
            "Building and fire approvals",
            "Operating consent and licences",
            "A colony or warehouse licence",
            "A file that is stuck",
            "Not sure yet",
          ],
          placeholder: "Choose one",
          activityLabel: "Your unit",
          submit: "Get my next steps",
          helper: "A Rapid expert will call you.",
          source: "hub-approvals",
        })
      : entry,
  );
  return { ...page, sections };
};

// ── The Your Project hub: the update ──────────────────────────────────────

const PROJECT_PATH = "your-project";
const SETTING_UP_PATH = "your-project/setting-up";

// Applies the Figma-layout-2 changes to the sections of the Your Project hub as
// they are stored (a copy; nothing is changed in place). Returns null when the
// page is not the Figma layout (no "Setting up" stage), so a page someone rebuilt
// is never touched. Safe to run twice: each change is made only if it is missing.
export const patchYourProject = (sections) => {
  const list = JSON.parse(JSON.stringify(Array.isArray(sections) ? sections : []));
  const setting = list.find((entry) => entry?.type === "stage_section" && entry.anchor === "setting-up");
  if (!setting) return null;

  if (!setting.data.secondary_cta_href) setting.data.secondary_cta_href = `/${SETTING_UP_PATH}`;

  if (!list.some((entry) => entry?.type === "logo_strip")) {
    const strip = makeSection("logo_strip", {
      anchor: "our-clients",
      data: { eyebrow: "Our clients", heading: "Businesses that trust Rapid.", count: 7 },
    });
    const at = list.findIndex((entry) => entry?.type === "masthead");
    list.splice(at + 1, 0, strip);
  }

  const form = list.findIndex((entry) => entry?.type === "enquiry_form");
  if (form !== -1 && !list.some((entry) => entry?.type === "closing_panel")) {
    list[form] = closing({
      heading: "Tell us where your project is.",
      intro:
        "Share a few details and an expert consultant from Rapid will call you back to understand the project. The first check is on us.",
      title: "Get your free first check.",
      selectLabel: "Where is your project?",
      options: STAGE_OPTIONS,
      placeholder: "Choose one",
      activityLabel: "What are you working on?",
      submit: "Get my next steps",
      helper: "A Rapid expert will call you.",
      source: "hub-your-project",
    });
  }
  return list;
};

// ── Situation page: Setting up a new unit ─────────────────────────────────

const chip = (label, href = "") => ({ label, href });

const settingUpPage = () => ({
  page_key: "pg_sitsettingup",
  template: "situation",
  locale: "en",
  path: SETTING_UP_PATH,
  title: "Setting up a new unit",
  h1: "Setting up a new factory in Haryana?",
  meta_title: "Setting up a new factory in Haryana | Rapid Consulting",
  meta_description:
    "Know which approvals your factory needs, what comes first and what could hold up production. Get a written approval roadmap from Rapid, free.",
  sections: [
    makeSection("masthead", {
      variant: "content",
      anchor: "hero",
      data: {
        eyebrow: "Your project · Setting up",
        heading: "Setting up a new factory in Haryana?",
        intro_html:
          "<p>Know which approvals your factory needs, what comes first and what could hold up production.</p>",
        primary_cta_label: "Discuss your project",
        show_whatsapp: true,
        highlights: [
          { title: "A written roadmap, free.", text: "" },
          { title: "One point person for the sequence.", text: "" },
          { title: "Loan and subsidy planned alongside.", text: "" },
        ],
        footnote: "",
        video_label: "Watch instead of reading",
        video_title: "Setting up a factory in Haryana: the approvals, in order",
        video_meta: "",
        video_url: "",
        rail_title: "Get your approval roadmap.",
        rail_hint: "",
        rail_select_label: "Where is your project?",
        rail_select_options: STAGE_OPTIONS.map((text) => ({ text })),
        rail_select_default: "Setting up",
        rail_activity_label: "What are you working on?",
        rail_submit_label: "Get my roadmap",
        rail_helper: "A Rapid expert will call you.",
      },
    }),

    // draft copy, needs Rapid approval.
    makeSection("qa_list", {
      label: "Quick answers",
      anchor: "quick-answers",
      data: {
        eyebrow: "Quick answers",
        heading: "What you need to know first.",
        intro: "",
        summary_label: "Summary",
        items: [
          {
            question: "Which approvals does a new factory need?",
            answer_html: `<p>It depends on the activity, the site and the size of the unit. Commonly: <a href="/en${L.clu}">Change of Land Use</a>, <a href="/en${L.buildingPlan}">building plan approval</a>, <a href="/en${L.cte}">consent to establish</a> and the <a href="/en${L.fire}">fire NOC</a>, then a <a href="/en${L.cto}">consent to operate</a> before production. Rapid maps which apply to your unit.</p>`,
          },
          {
            question: "What comes first?",
            answer_html:
              "<p>The land. The building plan needs the CLU, and the road decides whether your unit gets access at all.</p>",
          },
          {
            question: "Can I start building while an application is pending?",
            answer_html:
              "<p>An application receipt is not an approval. Check what each approval requires before work starts.</p>",
          },
          {
            question: "What could hold up production?",
            answer_html:
              "<p>A consent to operate, fire NOC or factory licence that is not in place when production is due to start. Each has its own documents and its own department.</p>",
          },
          {
            question: "Can the loan and the subsidy be planned at the same time?",
            answer_html:
              "<p>Yes. The bank and the scheme each check the project report, so it is prepared once for both. The lender and the department decide; Rapid does not guarantee a loan or a subsidy.</p>",
          },
        ],
      },
    }),

    // SAMPLE tiles: they show the layout and say so on the page.
    makeSection("case_tiles", {
      label: "Our work",
      anchor: "our-work",
      data: {
        eyebrow: "Client success",
        heading: "New units we've helped set up.",
        intro: "",
        sample: true,
        items: [
          { title: "A new food processing unit", location: "Haryana", sector: "Food and agro processing", role: "Approval roadmap, filings and follow-up", href: "" },
          { title: "A new engineering unit", location: "Haryana", sector: "Engineering and materials", role: "Approval roadmap, filings and follow-up", href: "" },
          { title: "A new warehouse", location: "Haryana", sector: "Commercial and logistics", role: "Approval roadmap, filings and follow-up", href: "" },
        ],
        view_all_href: "/case-studies",
      },
    }),

    // draft copy, from the Your Project hub's Setting up stage.
    makeSection("roadmap_timeline", {
      label: "The route",
      anchor: "the-route",
      data: {
        eyebrow: "The route",
        heading: "From plot to production, in order.",
        intro: "",
        items: [
          {
            title: "Before you build",
            rows: [
              { lead: "Settle the land.", text: "Check the zone, the road and the records before you pay for anything." },
              { lead: "Get the use of the land approved.", text: "The building plan needs the CLU." },
              { lead: "Find the consents your unit needs.", text: "The pollution category and the fire rules decide which apply." },
            ],
            links: [chip("CLU", L.clu), chip("Building plan", L.buildingPlan), chip("CTE", L.cte)],
          },
          {
            title: "While you build",
            rows: [
              { lead: "Apply in the order the approvals need.", text: "Drawings are sanctioned before work starts, and the consent to establish comes before construction." },
              { lead: "Keep the loan and the subsidy on one plan.", text: "Check the scheme's conditions before you order machinery." },
            ],
            links: [chip("Fire NOC", L.fire)],
          },
          {
            title: "Before production starts",
            rows: [
              { lead: "Get the operating consent.", text: "Production usually needs a consent to operate." },
              { lead: "Complete the building papers.", text: "An occupation certificate and a factory licence are usually needed too." },
            ],
            links: [chip("CTO", L.cto), chip("Occupation certificate", L.occupation)],
          },
          {
            title: "Once you're running",
            rows: [
              { lead: "Keep the renewals on one calendar.", text: "The consent, the fire NOC and the licence each have renewal dates." },
              { lead: "File the claims you are owed.", text: "Most subsidies need a claim, and some every year." },
            ],
            links: [chip("Running a unit", "/your-project#running")],
          },
        ],
        cta_label: "Get my approval roadmap",
        cta_preset: "setting-up-route",
      },
    }),

    // First tile is the spec's; the others are draft copy.
    makeSection("quote_cards", {
      label: "What you may hear",
      anchor: "what-you-may-hear",
      data: {
        eyebrow: "What you may hear",
        heading: "What owners are told, and what to check.",
        intro: "",
        items: [
          {
            quote: "The single-window portal handles everything.",
            note_label: "The portal",
            note: "A portal is where an application is filed. It does not decide which approvals your unit needs, or in what order.",
          },
          {
            quote: "You can start building. The approval will follow.",
            note_label: "Start of work",
            note: "An application receipt is not an approval. Ask what each approval requires before work starts.",
          },
          {
            quote: "The subsidy is automatic for a new unit.",
            note_label: "The subsidy",
            note: "Most schemes need a claim to be filed, and some every year.",
          },
          {
            quote: "The factory next door got its approval, so you will too.",
            note_label: "Your plot",
            note: "Zone, road and records differ from plot to plot.",
          },
        ],
      },
    }),

    makeSection("card_grid", {
      label: "Your roadmap",
      anchor: "your-roadmap",
      data: {
        heading: "What you get: your roadmap.",
        intro: "Each approval, in order, with a target date.",
        columns: "2",
        items: [
          { title: "Each approval your unit needs", text: "Listed for your activity and site, so nothing is missed.", href: "", link_label: "" },
          { title: "In the order they depend on each other", text: "Land use, building plan, consent to establish, fire NOC, then consent to operate.", href: "", link_label: "" },
          { title: "With a target date for each", text: "A date to work towards, so you can plan construction and the loan around it.", href: "", link_label: "" },
          { title: "In writing, and free", text: "The first check costs nothing and does not commit you to anything.", href: "", link_label: "" },
        ],
      },
    }),

    makeSection("rich_text", {
      label: "Loan and subsidy",
      anchor: "loan-and-subsidy",
      data: {
        heading: "Plan the loan and the subsidy together.",
        html: '<p>The bank checks whether the project can repay; the scheme checks which costs qualify. A project report written for only one of them can fail the other. Rapid prepares one report for both, and tells you which scheme conditions to check before you order machinery or sign the loan.</p><p>The lender and the department decide; Rapid does not guarantee a loan or a subsidy. See <a href="/en/subsidies">Subsidies</a> and <a href="/en/finance-and-insurance">Finance and insurance</a>.</p>',
      },
    }),

    makeSection("steps", {
      label: "Getting started",
      anchor: "getting-started",
      data: {
        heading: "Getting started is a short call.",
        intro: "",
        items: [
          { title: "Tell us about the unit", text: "What you plan to make, where, and by when." },
          { title: "Get a written roadmap", text: "Free: each approval in order, with a target date." },
          { title: "Decide what to take forward", text: "The scope, exclusions and timeline are agreed with you before any work begins." },
        ],
      },
    }),

    makeSection("card_grid", {
      label: "Services",
      anchor: "services",
      data: {
        heading: "Services for a new unit.",
        intro: "",
        columns: "3",
        items: [
          { title: "Change of Land Use (CLU)", text: "Farmland? Get it approved for your unit.", href: L.clu, link_label: "Explore" },
          { title: "Building plan approval", text: "Ready to build? Get your drawings sanctioned.", href: L.buildingPlan, link_label: "Explore" },
          { title: "Consent to Establish (CTE)", text: "Before construction? Get your pollution consent.", href: L.cte, link_label: "Explore" },
          { title: "Consent to Operate (CTO)", text: "Before production? Get permission to operate.", href: L.cto, link_label: "Explore" },
          { title: "Fire NOC", text: "Building? Get the fire clearance.", href: L.fire, link_label: "Explore" },
          { title: "Project finance", text: "New unit? Prepare your funding proposal.", href: L.projectFinance, link_label: "Explore" },
        ],
      },
    }),

    makeSection("rich_text", {
      label: "Already building",
      anchor: "already-building",
      data: {
        heading: "Already building?",
        html: '<p>If construction has started and an approval is missing or queried, you can still ask for a check. Send the application numbers and any letter you have received, and a Rapid expert will tell you what is holding it. See <a href="/en/your-project#file-stuck">Your Project: File stuck</a>.</p>',
      },
    }),

    makeSection("faq", {
      label: "FAQs",
      anchor: "faqs",
      data: {
        heading: "Questions about setting up a factory.",
        items: [...serviceFaq("S02"), FAQ_READY, FAQ_CALLBACK, FAQ_GUARANTEE],
      },
    }),

    makeSection("cta_panel", {
      anchor: "get-started",
      data: {
        heading: "Not sure where your unit stands?",
        text: "Share a short description of your project. An expert consultant from Rapid will call you to understand it.",
        button_label: "Get my approval roadmap",
        preset_kind: "enquiry",
      },
    }),
  ],
});

// ── The pages ─────────────────────────────────────────────────────────────

// Every page this seeder writes. `cases` are the published case studies the
// Subsidies hub shows ([{ id, slug, title }] read from the database).
export const buildPages = ({ cases = [] } = {}) => [
  subsidiesPage({ cases }),
  financePage(),
  approvalsHub(),
  settingUpPage(),
];

const CASE_SLUGS = siteContent.case_study_slugs;

// ── Helpers ───────────────────────────────────────────────────────────────

// JSON with sorted keys, so a stored (reordered) JSONB value compares equal.
const stable = (value) =>
  JSON.stringify(value, (key, entry) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : entry,
  );

// The navigation the Round-2 seeder (20261024100001) stored as its default.
const OLD_NAVIGATION = {
  primary: [
    { key: "approvals", label: "Approvals", href: "/services/statutory-approvals-consultant", visible: true },
    { key: "subsidies", label: "Subsidies", href: "/services/msmes-subsidy-consultant", visible: true },
    { key: "your-project", label: "Your project", href: "/your-project", visible: true },
    { key: "industries", label: "Industries", href: "/industries", visible: true },
    { key: "work", label: "Work", href: "/case-studies", visible: true },
    { key: "resources", label: "Resources", href: "/resources", visible: true },
    { key: "about", label: "About", href: "/about", visible: true },
  ],
  footer: [],
};
const newNavigation = () => ({
  ...OLD_NAVIGATION,
  primary: OLD_NAVIGATION.primary.map((item) =>
    item.key === "approvals"
      ? { ...item, href: `/${APPROVALS_HUB_PATH}` }
      : item.key === "subsidies"
        ? { ...item, href: "/subsidies" }
        : item,
  ),
});

const prepare = (page) => {
  const { sections, errors } = normaliseSections(page.sections, { template: page.template, strict: true });
  if (errors.length) {
    throw new Error(`Seed page "${page.path}" is not valid: ${errors.map((error) => error.message).join("; ")}`);
  }
  return { ...page, sections };
};

const metaOf = (page) => ({
  title: page.title,
  h1: page.h1,
  meta_title: page.meta_title,
  meta_description: page.meta_description,
});

const snapshotOf = (page) => ({
  template: page.template,
  locale: page.locale,
  path: page.path,
  ...metaOf(page),
  translation_status: "missing",
  sections: page.sections,
});

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  const now = new Date();
  const done = { created: 0, replaced: 0, proposed: 0, skipped: 0, patched: 0, navigation: 0 };

  // The published case studies for the Subsidies hub, in the order of the list.
  // Read before the transaction: if the table is not there the page simply
  // goes without that section.
  let cases = [];
  try {
    const rows = await sequelize.query(
      "SELECT id, slug, title FROM case_studies WHERE slug IN (:slugs) AND is_published = true",
      { replacements: { slugs: CASE_SLUGS }, type: "SELECT" },
    );
    cases = CASE_SLUGS.map((slug) => rows.find((row) => row.slug === slug))
      .filter(Boolean)
      .map((row) => ({ id: row.id, slug: row.slug, title: row.title }));
  } catch {
    cases = [];
  }

  const prepared = buildPages({ cases }).map(prepare);

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "SELECT" });
    const run = (sql, replacements = {}) => sequelize.query(sql, { replacements, transaction });

    const revision = (pageId, version, action, note, page) =>
      queryInterface.bulkInsert(
        "site_page_revisions",
        [
          {
            id: randomUUID(),
            site_page_id: pageId,
            version,
            action,
            note,
            snapshot: JSON.stringify(snapshotOf(page)),
            created_by: null,
            created_by_name: "Seeder",
            created_at: now,
          },
        ],
        { transaction },
      );

    // ── new and restyled pages ──
    for (const page of prepared) {
      const [existing] = await select(
        "SELECT id, version, status FROM site_pages WHERE (locale = :locale AND path = :path) OR page_key = :page_key",
        { locale: page.locale, path: page.path, page_key: page.page_key },
      );

      if (!existing) {
        const id = randomUUID();
        await queryInterface.bulkInsert(
          "site_pages",
          [
            {
              id,
              page_key: page.page_key,
              group_id: randomUUID(),
              template: page.template,
              locale: page.locale,
              path: page.path,
              ...metaOf(page),
              status: "published",
              translation_status: "missing",
              sections: JSON.stringify(page.sections),
              published_sections: JSON.stringify(page.sections),
              published_meta: JSON.stringify(metaOf(page)),
              published_at: now,
              version: 1,
              has_unpublished_changes: false,
              created_by: null,
              updated_by: null,
              created_at: now,
              updated_at: now,
            },
          ],
          { transaction },
        );
        await revision(id, 1, "publish", NOTE_INITIAL, page);
        done.created++;
        continue;
      }

      const revisions = await select("SELECT note FROM site_page_revisions WHERE site_page_id = :id", {
        id: existing.id,
      });
      if (revisions.some((entry) => MARKERS.includes(entry.note))) {
        done.skipped++;
        continue;
      }

      // Still exactly as first seeded: replace the sections and publish.
      if (existing.version === 1 && revisions.length <= 1 && existing.status === "published") {
        await run(
          `UPDATE site_pages SET
             title = :title, h1 = :h1, meta_title = :meta_title, meta_description = :meta_description,
             sections = CAST(:sections AS jsonb), published_sections = CAST(:sections AS jsonb),
             published_meta = CAST(:meta AS jsonb), published_at = :now, version = 2,
             has_unpublished_changes = false, updated_at = :now
           WHERE id = :id`,
          {
            id: existing.id,
            title: page.title,
            h1: page.h1,
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            sections: JSON.stringify(page.sections),
            meta: JSON.stringify(metaOf(page)),
            now,
          },
        );
        await revision(existing.id, 2, "publish", NOTE_REPLACED, page);
        done.replaced++;
        continue;
      }

      // Edited (or unpublished, or already moved on) by someone: leave it alone
      // and add the new layout to the history so it can be restored.
      await revision(existing.id, existing.version, "save", NOTE_PROPOSED, page);
      done.proposed++;
    }

    // ── the Your Project hub: logo strip, Setting up link, closing panel ──
    const [project] = await select(
      `SELECT id, version, status, sections, has_unpublished_changes, title, h1, meta_title, meta_description
         FROM site_pages WHERE locale = 'en' AND path = :path`,
      { path: PROJECT_PATH },
    );
    if (project) {
      const history = await select(
        "SELECT version, note, created_by_name FROM site_page_revisions WHERE site_page_id = :id ORDER BY version DESC, created_at DESC",
        { id: project.id },
      );
      if (history.some((entry) => entry.note === NOTE_PATCHED || entry.note === NOTE_PATCH_PROPOSED)) {
        done.skipped++;
      } else {
        const patchedSections = patchYourProject(project.sections);
        if (patchedSections) {
          const { sections, errors } = normaliseSections(patchedSections, { template: "hub", strict: true });
          if (errors.length) {
            throw new Error(`Seed page "${PROJECT_PATH}" update is not valid: ${errors.map((error) => error.message).join("; ")}`);
          }
          const page = {
            template: "hub",
            locale: "en",
            path: PROJECT_PATH,
            title: project.title,
            h1: project.h1,
            meta_title: project.meta_title,
            meta_description: project.meta_description,
            sections,
          };
          // Untouched since a seeder wrote it: the newest revision is the page's
          // own version and was written by the seeder.
          const newest = history[0];
          const untouched =
            project.status === "published" &&
            !project.has_unpublished_changes &&
            newest &&
            newest.version === project.version &&
            newest.created_by_name === "Seeder";
          if (untouched) {
            const version = project.version + 1;
            await run(
              `UPDATE site_pages SET
                 sections = CAST(:sections AS jsonb), published_sections = CAST(:sections AS jsonb),
                 published_at = :now, version = :version, has_unpublished_changes = false, updated_at = :now
               WHERE id = :id`,
              { id: project.id, sections: JSON.stringify(sections), version, now },
            );
            await revision(project.id, version, "publish", NOTE_PATCHED, page);
            done.patched++;
          } else {
            await revision(project.id, project.version, "save", NOTE_PATCH_PROPOSED, page);
            done.proposed++;
          }
        } else {
          done.skipped++;
        }
      }
    }

    // ── navigation: Approvals and Subsidies lead to their hubs ──
    const [navigation] = await select("SELECT value FROM site_settings WHERE key = 'navigation'");
    if (navigation && stable(navigation.value) === stable(OLD_NAVIGATION)) {
      await run("UPDATE site_settings SET value = CAST(:value AS jsonb), updated_at = :now WHERE key = 'navigation'", {
        value: JSON.stringify(newNavigation()),
        now,
      });
      done.navigation = 1;
    }
  });

  console.log(
    `✅ Figma hubs 2: ${done.created} created, ${done.replaced} replaced, ${done.patched} updated, ` +
      `${done.proposed} added to revision history (page was edited), ${done.skipped} already done, ` +
      `${done.navigation} navigation setting updated` +
      (cases.length ? "" : ". No published case studies found: the Subsidies hub went without its client success row."),
  );
}

export async function down({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "SELECT" });
    const run = (sql, replacements = {}) => sequelize.query(sql, { replacements, transaction });

    const putBack = async (id, snapshot, version) => {
      const old = snapshot ?? {};
      await run(
        `UPDATE site_pages SET
           title = :title, h1 = :h1, meta_title = :meta_title, meta_description = :meta_description,
           sections = CAST(:sections AS jsonb), published_sections = CAST(:sections AS jsonb),
           published_meta = CAST(:meta AS jsonb), version = :version, updated_at = :now
         WHERE id = :id`,
        {
          id,
          title: old.title ?? "",
          h1: old.h1 ?? "",
          meta_title: old.meta_title ?? "",
          meta_description: old.meta_description ?? "",
          sections: JSON.stringify(old.sections ?? []),
          meta: JSON.stringify({
            title: old.title ?? "",
            h1: old.h1 ?? "",
            meta_title: old.meta_title ?? "",
            meta_description: old.meta_description ?? "",
          }),
          version,
          now: new Date(),
        },
      );
    };

    // Pages this seeder created or replaced, plus the Your Project hub.
    for (const page of buildPages()) {
      const [row] = await select("SELECT id, version FROM site_pages WHERE locale = :locale AND path = :path", {
        locale: page.locale,
        path: page.path,
      });
      if (!row) continue;

      await run("DELETE FROM site_page_revisions WHERE site_page_id = :id AND note = :note", {
        id: row.id,
        note: NOTE_PROPOSED,
      });

      const [initial] = await select(
        "SELECT id FROM site_page_revisions WHERE site_page_id = :id AND note = :note",
        { id: row.id, note: NOTE_INITIAL },
      );
      // Created by this seeder and never edited: remove the page (revisions go with it).
      if (initial && row.version === 1) {
        await run("DELETE FROM site_pages WHERE id = :id", { id: row.id });
        continue;
      }

      const [replaced] = await select(
        "SELECT id, version FROM site_page_revisions WHERE site_page_id = :id AND note = :note",
        { id: row.id, note: NOTE_REPLACED },
      );
      if (replaced && row.version === replaced.version) {
        const [first] = await select(
          "SELECT snapshot FROM site_page_revisions WHERE site_page_id = :id AND version < :version ORDER BY version DESC, created_at ASC LIMIT 1",
          { id: row.id, version: replaced.version },
        );
        if (first?.snapshot) {
          await putBack(row.id, first.snapshot, replaced.version - 1);
          await run("DELETE FROM site_page_revisions WHERE id = :id", { id: replaced.id });
        }
      }
    }

    const [project] = await select("SELECT id, version FROM site_pages WHERE locale = 'en' AND path = :path", {
      path: PROJECT_PATH,
    });
    if (project) {
      await run("DELETE FROM site_page_revisions WHERE site_page_id = :id AND note = :note", {
        id: project.id,
        note: NOTE_PATCH_PROPOSED,
      });
      const [patched] = await select(
        "SELECT id, version FROM site_page_revisions WHERE site_page_id = :id AND note = :note",
        { id: project.id, note: NOTE_PATCHED },
      );
      if (patched && project.version === patched.version) {
        const [before] = await select(
          "SELECT snapshot FROM site_page_revisions WHERE site_page_id = :id AND version < :version ORDER BY version DESC, created_at ASC LIMIT 1",
          { id: project.id, version: patched.version },
        );
        if (before?.snapshot) {
          await putBack(project.id, before.snapshot, patched.version - 1);
          await run("DELETE FROM site_page_revisions WHERE id = :id", { id: patched.id });
        }
      }
    }

    // Navigation: only if nobody changed it since this seeder did.
    const [navigation] = await select("SELECT value FROM site_settings WHERE key = 'navigation'");
    if (navigation && stable(navigation.value) === stable(newNavigation())) {
      await run("UPDATE site_settings SET value = CAST(:value AS jsonb), updated_at = :now WHERE key = 'navigation'", {
        value: JSON.stringify(OLD_NAVIGATION),
        now: new Date(),
      });
    }
  });
  console.log("⚠️  Rolled back: Figma hubs 2 (pages edited since were left as they are)");
}
