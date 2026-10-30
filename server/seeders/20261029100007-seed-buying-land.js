// seeders/20261029100007-seed-buying-land.js
// Round 3, batch 5 (29 October 2026): the situation page "Buying land for a
// factory" (Figma node 1061-36299), built with the page builder in the same way
// as the "Setting up a new unit" page.
//
//   your-project/buying-land   NEW situation page "Buying land for a factory"
//   your-project               small update: the "Buying land" stage gets the
//                              second button "Explore buying land support",
//                              which opens /your-project/buying-land. Done only
//                              when that stage has no second button at all
//                              (no label and no link).
//
// Copy. The Figma wireframe text (Rapid-approved) is used word for word, from
// doc/figma-text/buying-land.md. Placeholders ([Name], [date], [Outcome],
// [Industry], [District], XX, X.X, XXXXX) stay exactly as the design has them.
// Anything the transcription marks as not seen, uncertain or unreadable is
// left OUT and nothing is invented: the third case card, the answers of FAQs 2
// to 5, the fourth review, the text inside the sample report thumbnail, the
// Reports tab and the full-width photo of "Next steps". The page is English
// only. The block for each part of the design is the closest one the page
// builder has (see the notes next to each section).
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100007-seed-buying-land
//
// Safe to run again, and it never overwrites an editor's work:
//   - a page that is still exactly as first seeded (version 1, one revision)
//     is replaced and published as the next version;
//   - a page that has been edited is left alone; the seeded layout is added to
//     its revision history ("Buying land ...") so an editor can restore it;
//   - a page already handled by this seeder is skipped.
// After running, save or publish a page in the dashboard (or wait for the
// website's revalidate interval) to refresh the website cache.

import { randomUUID } from "node:crypto";
import { makeSection, normaliseSections } from "../app/helpers/site-page-registry.js";
import { PAGE as LINKS } from "./20261029100001-seed-figma-hubs.js";

const PAGE_PATH = "your-project/buying-land";
const HUB_PATH = "your-project";
const HUB_ANCHOR = "buying-land";
const HUB_BUTTON = "Explore buying land support";

// Revision notes double as markers, so a second run recognises its own work.
const NOTE_INITIAL = "Buying land page (seeded)";
const NOTE_REPLACED = "Buying land page (seeded, replaces the first seeded sections)";
const NOTE_PROPOSED = "Buying land page (seeded). Restore this revision to use it";
const NOTE_HUB = "Buying land page (seeded): link from the Your Project hub";
const MARKERS = [NOTE_INITIAL, NOTE_REPLACED, NOTE_PROPOSED];

// ── Builders ──────────────────────────────────────────────────────────────

// A section. `anchor` is the target of the jump links; `label` puts the
// section in the sticky menu (a section without a label is not in the menu).
const sec = (type, anchor, label, data, variant) =>
  makeSection(type, { anchor, label, ...(variant ? { variant } : {}), data });

const texts = (...values) => values.map((text) => ({ text }));
const lines = (...values) => values.join("\n");
const para = (html) => `<p>${html}</p>`;
const WHATSAPP_HREF = "https://wa.me/919467248028";

// ── The page ──────────────────────────────────────────────────────────────

const buyingLandPage = () => ({
  page_key: "pg_sitbuyingland",
  template: "situation",
  locale: "en",
  path: PAGE_PATH,
  title: "Buying land for a factory",
  h1: "Buying land for a factory in Haryana?",
  meta_title: "Buying land for a factory in Haryana? | Rapid Consulting",
  meta_description: "Don't pay the token until you know the plot can take your factory, and what it will really cost.",
  sections: [
    // Hero: copy on the left with the video card, the white enquiry card is the
    // side rail (rail_* fields). The design has no hero buttons.
    sec(
      "masthead",
      "hero",
      "",
      {
        eyebrow: "YOUR PROJECT · BUYING LAND",
        heading: "Buying land for a factory in Haryana?",
        intro_html: para("Don't pay the token until you know the plot can take your factory, and what it will really cost."),
        primary_cta_label: "",
        show_whatsapp: false,
        highlights: [
          {
            title: "The checks a broker won't do",
            text: "Zone, road, land records and what's on the ground, checked against the unit you plan.",
          },
          { title: "A straight answer, even if it's no", text: "If the plot won't work, we tell you before you pay." },
          { title: "One team after you buy", text: "CLU and the approvals your factory needs next." },
        ],
        footnote: "",
        video_label: "WATCH INSTEAD OF READING",
        video_title: "Before you buy farmland for a factory: what to check",
        video_text: "What decides it, what's in the records, and what it really costs.",
        video_meta: "3:00 · Captions on",
        video_url: "",
        rail_title: "Check your plot before you pay the token.",
        rail_hint: "",
        rail_select_label: "",
        rail_select_options: [],
        rail_select_default: "",
        rail_activity_label: "What you want to build",
        rail_submit_label: "Check my plot",
        rail_helper: "A Rapid expert will call to understand your plot.",
        rail_badge_text: "FREE / 48-HOUR LAND CHECK",
        rail_required_label: "Required",
        rail_optional_label: "Optional",
        rail_name_placeholder: "Your full name",
        rail_phone_placeholder: "10 digits",
        rail_district_placeholder: "e.g. Hisar",
        rail_site_label: "Village / khasra",
        rail_site_placeholder: "If known",
        rail_activity_placeholder: "e.g. Food processing unit",
      },
      "content",
    ),

    sec("logo_strip", "our-clients", "", { eyebrow: "OUR CLIENTS", heading: "Businesses that trust Rapid.", count: 7 }),

    // The links in the answers are the small rust jump links of the design.
    sec("qa_list", "quick-answers", "Quick answers", {
      eyebrow: "QUICK ANSWERS",
      heading: "What you need to know first",
      intro: "",
      summary_label: "",
      items: [
        {
          question: "Can farmland take a factory?",
          answer_html: para(
            `Often, yes, if the zone, the road and your unit's category allow it. <a href="#what-we-check">What we check ↓</a>`,
          ),
        },
        {
          question: "What does buying cost beyond the price?",
          answer_html: para(
            `Stamp duty and registration at the registry, then CLU charges if the land needs a change of use. <a href="#real-cost">Real cost ↓</a>`,
          ),
        },
        {
          question: "Farmland or an HSIIDC plot?",
          answer_html: para(
            `Farmland usually costs less but needs CLU. An estate plot is ready for industry. <a href="#farmland-or-hsiidc">Compare ↓</a>`,
          ),
        },
        { question: "How fast can I know?", answer_html: para("Within 48 hours.") },
        {
          question: "Already paid a token?",
          answer_html: para(
            `You can still check the plot. Do it before you pay more. <a href="#already-paid">Already paid ↓</a>`,
          ),
        },
      ],
      footnote: "Rules last checked 18 October 2026.",
    }),

    // Case-study carousel. The design's card has a figure panel, a title, a
    // Service / Industry / Location table and an outline button. Only the two
    // cards the design shows are here (the counter says 3; the third is not seen).
    sec(
      "case_cards",
      "our-work",
      "Our work",
      {
        eyebrow: "CLIENT SUCCESS",
        heading: "Plots we've checked for businesses like yours.",
        intro: "Real land checks we've done.",
        filter_label: "",
        all_label: "",
        filters: [],
        count_template: "",
        items: [
          {
            panel_label: "CLIENT SUCCESS",
            amount: "₹XX crore",
            caption: "Land value checked",
            status: "",
            date_label: "Checked on",
            date_value: "[date]",
            title: "Farmland for a food unit: checked before the token",
            rows: [
              { label: "Service", value: "Land Check", href: "" },
              { label: "Industry", value: "[Industry]", href: "" },
              { label: "Location", value: "[District], Haryana", href: "" },
            ],
            cta_label: "See how Rapid helped",
            href: "",
          },
          {
            panel_label: "CLIENT SUCCESS",
            amount: "₹XX crore",
            caption: "Land value checked",
            status: "",
            date_label: "Checked on",
            date_value: "[date]",
            title: "Highway plot: access sorted before registry",
            rows: [
              { label: "Service", value: "Land Check", href: "" },
              { label: "Industry", value: "[Industry]", href: "" },
              { label: "Location", value: "[District], Haryana", href: "" },
            ],
            cta_label: "See how Rapid helped",
            href: "",
          },
        ],
        footnote: "",
        cta_label: "View all case studies",
        cta_href: "/case-studies",
      },
      "carousel",
    ),

    // Myths carousel: the design's quotation marks are drawn by the block.
    sec("quote_cards", "what-you-may-hear", "What you may hear", {
      eyebrow: "BEFORE YOU BUY",
      heading: "Land buying myths you hear.",
      intro: "",
      items: [
        {
          quote: "The factory next door got approval.",
          note_label: "YOUR PLOT, YOUR PROPOSED USE",
          note: "Its approval relates to its own plot and activity. Check your zone, road access and proposed unit before relying on the comparison.",
        },
        {
          quote: "It's near the highway. Ideal for a factory.",
          note_label: "ACCESS & USABLE LAND",
          note: "Check road access and highway setbacks before judging the plot. The area you can use may differ from the area you buy.",
        },
        {
          quote: "We'll handle approvals after registry.",
          note_label: "BEFORE YOU COMMIT",
          note: "Buying first can leave you with costly constraints. Get the plot checked before paying a token or committing to registry.",
        },
        {
          quote: "The road is wide enough for any factory.",
          note_label: "ROAD & PROPOSED ACTIVITY",
          note: "Have the road details checked against your intended activity. A seller's description is not a site-specific assessment.",
        },
        {
          quote: "CLU will happen. Don't worry.",
          note_label: "CHECK BEFORE AN APPLICATION",
          note: "Ask what supports that assurance. Review the zone, access and proposed activity first; the authority decides the application.",
        },
        {
          quote: "The papers are clear. We're ready.",
          note_label: "TITLE & LAND USE",
          note: "An advocate's title opinion and a land-use assessment answer different questions. Check both before you commit.",
        },
      ],
    }),

    // The footer line under the myths carousel.
    sec("rich_text", "check-the-plot", "", {
      heading: "",
      html: "<p><strong>Check the plot, not the promise.</strong></p>",
    }),

    // Numbered list of the six checks.
    sec("steps", "what-we-check", "What we check", {
      eyebrow: "WHAT WE CHECK",
      heading: "What we check on your plot.",
      intro: "",
      items: [
        { title: "Zone and CLU", text: "Whether your unit is allowed in the plot's zone, and whether CLU is possible." },
        { title: "Road and access", text: "The road's width, and any NHAI, PWD or canal-crossing permission you'd need." },
        {
          title: "Land records",
          text: "Whether the seller is the recorded owner, and any co-owners, mortgage, court case or pending mutation.",
        },
        {
          title: "On and around the plot",
          text: "HT lines, canals, railways, pipelines, low-lying land, and schools or homes close by.",
        },
        { title: "Water and power", text: "The groundwater status of the block, and how easily you'll get a power connection." },
        { title: "Time and cost", text: "An approximate timeline and the charges to expect before you can build." },
      ],
      cta_label: "More on CLU",
      cta_href: LINKS.clu,
    }),

    // The grey sample-report card beside the checks. The text inside its
    // thumbnail is only partly readable in the design, so it is not copied.
    sec("feature_cards", "sample-report", "", {
      eyebrow: "",
      heading: "",
      intro: "",
      filter_label: "",
      filters: [],
      items: [
        {
          tag: "",
          kicker: "",
          title: "Sample Land Check report",
          text: "One page, in writing.",
          meta: "",
          note: "",
          href: "",
          cta_label: "View the sample",
        },
      ],
      footer_text: "",
      cta_label: "",
      cta_href: "",
    }),

    sec("comparison", "farmland-or-hsiidc", "Farmland or HSIIDC", {
      heading: "Farmland or an HSIIDC estate plot?",
      intro: "Most buyers weigh these two. Here's how they differ.",
      columns: texts("Farmland", "HSIIDC estate plot"),
      rows: [
        {
          label: "How you buy",
          values: lines("From the owner, through a registry", "By e-auction or allotment from HSIIDC"),
        },
        {
          label: "Before you build",
          values: lines("CLU, or a DTP NOC outside planned areas", "No CLU; the estate's building rules apply"),
        },
        {
          label: "Roads and power",
          values: lines(
            "Checked and arranged for your plot",
            "Estate roads and services; possession can wait until they're ready",
          ),
        },
        { label: "Price", values: lines("Usually lower per acre", "Usually higher, set by HSIIDC") },
        {
          label: "Suits",
          values: lines("A specific location, or a lower land cost", "Starting sooner in an established estate"),
        },
      ],
    }),

    // The navy "Cost and registry" panel: each group label is the card's tag.
    sec("feature_cards", "real-cost", "Real cost", {
      eyebrow: "COST AND REGISTRY",
      heading: "The land price isn't the whole cost.",
      intro: "Know what you'll pay, and when, before you commit.",
      filter_label: "",
      filters: [],
      items: [
        {
          tag: "WHAT YOU PAY",
          kicker: "",
          title: "At the registry",
          text: "Stamp duty on rural land: 5% for men, 3% for women, 4% for joint buyers, on the higher of the deal value and the collector rate. Registration fee: 1%.",
          meta: "",
          note: "",
          href: "",
          cta_label: "",
        },
        {
          tag: "WHAT YOU PAY",
          kicker: "",
          title: "To use it for a factory",
          text: "CLU: an application fee, then conversion charges set by the zone and town, and development charges in some areas.",
          meta: "",
          note: "",
          href: "",
          cta_label: "",
        },
        {
          tag: "WHAT YOU PAY",
          kicker: "",
          title: "Ways to pay less",
          text: "MSMEs in less-developed blocks pay half the CLU conversion charges.",
          meta: "",
          note: "",
          href: "",
          cta_label: "",
        },
        {
          tag: "WHY CHECK FIRST",
          kicker: "",
          title: "Waiting costs money",
          text: "Every month the land waits for approvals ties up your money. Checking before you buy is the cheapest step.",
          meta: "",
          note: "",
          href: "",
          cta_label: "",
        },
      ],
      footer_text: "",
      cta_label: "",
      cta_href: "",
    }),

    // "What you send / What we do": two cards.
    sec("feature_cards", "getting-started", "Getting started", {
      eyebrow: "WORKING WITH RAPID",
      heading: "You send three things. We handle the rest.",
      intro: "",
      filter_label: "",
      filters: [],
      items: [
        {
          tag: "",
          kicker: "",
          title: "TO GET STARTED, SEND",
          text: lines(
            "1  Your khasra number, or a photo of the jamabandi (the land record)",
            "2  The village and district, or a map pin",
            "3  What you want to build",
            "+  Already paid a token? The agreement or receipt.",
          ),
          meta: "",
          note: "We'll ask for anything else as we go.",
          href: "",
          cta_label: "",
        },
        {
          tag: "",
          kicker: "",
          title: "What we do",
          text: lines(
            "Checks your plot for free and tells you plainly if it won't work",
            "Checks the title and land records before registry",
            "Handles CLU and lines up the approvals your factory needs next",
          ),
          meta: "",
          note: "",
          href: "",
          cta_label: "",
        },
      ],
      footer_text: "",
      cta_label: "",
      cta_href: "",
    }),

    // 2x2 grid: the service, its question line and the next step. The cards
    // link only where the website has a page. The full-width photo is not seen.
    sec("card_grid", "next-steps", "Next steps", {
      heading: "From token to factory: what comes next.",
      intro: "Next, we can help you with:",
      columns: "2",
      items: [
        {
          title: "Pre-purchase due diligence",
          text: lines("Ready to register?", "Get zone, road and title checked in writing."),
          href: "",
          link_label: "",
        },
        {
          title: "Change of Land Use (CLU)",
          text: lines("Farmland?", "Get it approved for your unit."),
          href: LINKS.clu,
          link_label: "",
        },
        {
          title: "Land demarcation",
          text: lines("Bought the land?", "Fix its boundaries on record."),
          href: "",
          link_label: "",
        },
        {
          title: "Road access NOC",
          text: lines("On a highway or state road?", "Get entry approved."),
          href: LINKS.roadAccess,
          link_label: "",
        },
      ],
    }),

    // "Token paid": the white "Send us" card is the tab with its three rows.
    sec("tabs_panel", "already-paid", "Already paid", {
      eyebrow: "TOKEN PAID",
      heading: "Paid a token already? Find out where you stand before you pay more.",
      intro:
        "The usual surprises: the zone doesn't allow your unit, the road is too narrow, or there's another owner's name in the records. We check the plot as it stands and tell you what can be done.",
      tab_layout: "top",
      tabs: [
        {
          label: "Send us",
          title: "",
          text: "",
          chips: [],
          note_label: "",
          note_text: "",
          callout: "",
          cards: [
            { title: "The agreement, receipt or registry", text: "", hint: "", href: "" },
            { title: "The khasra number", text: "", hint: "", href: "" },
            { title: "What you want to build", text: "", hint: "", href: "" },
          ],
          cta_label: "Check where I stand",
          cta_href: "",
        },
      ],
      footer_text: "",
      footer_cta_label: "",
      footer_cta_href: "",
    }),

    sec("team_cards", "who-will-check", "", {
      eyebrow: "",
      heading: "Who'll check your plot",
      intro: "",
      items: [
        {
          initials: "LA",
          caption: "",
          tag: "LAND AND APPROVALS EXPERT",
          name: "[Name]",
          role: "Reads the plan, the records and the site, and signs off your Land Check.",
          detail: "",
          href: "",
          link_label: "",
        },
        {
          initials: "LT",
          caption: "",
          tag: "LAND TEAM LEAD",
          name: "[Name]",
          role: "Runs your check and keeps you posted.",
          detail: "",
          href: "",
          link_label: "",
        },
      ],
      footer_text: "",
      cta_label: "",
      cta_href: "",
    }),

    // Three of the four review cards (the fourth is not seen). A name or
    // business left as the placeholder keeps the design's "Client name" /
    // "Business name".
    sec("reviews_carousel", "reviews", "", {
      eyebrow: "CLIENT EXPERIENCES",
      heading: "In our clients' words.",
      intro: "What it feels like to have Rapid on your side.",
      rating_label: "Overall rating",
      rating_value: "X.X",
      rating_count: "XX",
      rating_source: "XXXXX",
      trust_label: "TRUSTED BY GROWING BUSINESSES",
      services_label: "SERVICES TAKEN",
      items: [
        {
          quote: "Rapid brought the paperwork, our CA and the bank onto one clear plan. We always knew what was needed next.",
          name: "Client name",
          business: "Business name",
          location: "Hisar, Haryana",
          rating: "5",
          services: texts("Land Check"),
        },
        {
          quote:
            "The team explained what was needed at every stage. One point of contact made the paperwork and follow-ups much easier.",
          name: "Client name",
          business: "Business name",
          location: "Panipat, Haryana",
          rating: "5",
          services: texts("Land Check"),
        },
        {
          quote: "Rapid brought our CA, bank and machinery supplier onto the same page. We knew which documents were needed next.",
          name: "Client name",
          business: "Business name",
          location: "Sonipat, Haryana",
          rating: "5",
          services: texts("Land Check"),
        },
      ],
      cta_label: "View all reviews",
      cta_href: "",
    }),

    // Only the first answer is shown in the design (open). The other four
    // answers are collapsed there and not seen, so they are left empty.
    sec("faq_accordion", "faqs", "FAQs", {
      eyebrow: "BUYING LAND / FAQs",
      heading: "Common questions about buying land",
      intro: "",
      items: [
        {
          question: "How do I check a khasra number or jamabandi online?",
          answer_html: para(
            "On the Haryana Jamabandi portal, by district, tehsil, village and khasra number. Or send us the khasra number and we'll check it along with the zone and road.",
          ),
        },
        { question: "What documents should I ask the seller for?", answer_html: "" },
        { question: "What is Section 7A, and does my plot need an NOC?", answer_html: "" },
        { question: "Does the Land Check replace a lawyer's title opinion?", answer_html: "" },
        { question: "Do you guarantee the plot will get CLU?", answer_html: "" },
      ],
      cta_label: "View all FAQs",
      cta_href: "/faqs",
    }),

    // The design shows Guides active, with Articles and Reports as the other
    // tabs. The page builder has no tab switcher for cards, so the two guides
    // and the article are cards in one row. The Reports tab has no seen content.
    sec(
      "feature_cards",
      "related-reading",
      "",
      {
        eyebrow: "RELATED READING",
        heading: "Want the details?",
        intro: "",
        filter_label: "",
        filters: [],
        items: [
          {
            tag: "GUIDE",
            kicker: "",
            title: "Before buying or leasing land: check the proposed use",
            text: "What to confirm about zone, access and use before you commit.",
            meta: "Practical guidance",
            note: "",
            href: "/guides/change-in-land-use",
            cta_label: "Read guide",
          },
          {
            tag: "GUIDE",
            kicker: "",
            title: "Change of Land Use in Haryana: the complete guide",
            text: "Every step of CLU, and the full document list.",
            meta: "Practical guidance",
            note: "",
            href: "/guides/change-of-land-use-clu-haryana",
            cta_label: "Read guide",
          },
          {
            tag: "ARTICLE",
            kicker: "",
            title: "What should a CLU consultant do for you?",
            text: "What to expect from the person handling your file, and what stays with your lawyer and architect.",
            meta: "Practical guidance",
            note: "",
            href: "",
            cta_label: "Read article",
          },
        ],
        footer_text: "",
        cta_label: "View all guides",
        cta_href: "/guides",
      },
      "carousel",
    ),

    sec("team_cards", "author-and-sources", "", {
      eyebrow: "AUTHOR AND SOURCES",
      heading: "The people behind this guidance.",
      intro: "",
      items: [
        {
          initials: "RC",
          caption: "",
          tag: "Author",
          name: "Rapid Consulting editorial team",
          role: "",
          detail: "",
          href: "",
          link_label: "Editorial team",
        },
      ],
      footer_text:
        "Sources: Haryana Development and Regulation of Urban Areas (Second Amendment and Validation) Act, 2020 (Section 7A) · Industrial CLU policy, 01.10.2015 · Industries on farmland, 19.03.2021 · Amendment, 28.04.2026 · Road access rules, 11.11.2025 · Clarification, 14.09.2026",
      cta_label: "",
      cta_href: "",
    }),

    // The design's closing panel has a button and a WhatsApp line (no form),
    // so it is the navy banner with a photo placeholder.
    sec("banner", "closing", "", {
      eyebrow: "NEXT STEP",
      heading: "Send us your khasra number. We'll tell you if the plot works.",
      subheading: "",
      text: "Your first check is free.",
      primary_label: "Check my plot",
      primary_href: "",
      secondary_label: "WhatsApp +91 94672 48028",
      secondary_href: WHATSAPP_HREF,
      tone: "navy",
      image: "",
      image_alt: "",
      photo_note:
        "Placeholder: a roadside or aerial photo of farmland with its approach road in Haryana. Licensed or commissioned, labelled as representative.",
    }),
  ],
});

// ── The pages ─────────────────────────────────────────────────────────────

export const buildPages = () => [buyingLandPage()];

// ── Plumbing (same safe-seed rule as the earlier Figma seeders) ───────────

const prepare = (page) => {
  const { sections, errors } = normaliseSections(page.sections, { template: page.template, strict: true });
  if (errors.length) {
    throw new Error(`Seed page "${page.path}" is not valid: ${errors.map((error) => error.message).join("; ")}`);
  }
  return { ...page, sections };
};

const metaOf = (page) => ({
  title: page.title,
  h1: page.h1 || null,
  meta_title: page.meta_title || null,
  meta_description: page.meta_description || null,
});

const snapshotOf = (page) => ({
  template: page.template,
  locale: page.locale,
  path: page.path,
  ...metaOf(page),
  translation_status: "missing",
  sections: page.sections,
});

// The hub's "Buying land" stage with its second button. Returns a changed
// copy of `sections`, or null when there is nothing to do: no such stage, or
// the stage already has a second button label or link (somebody set one).
export const patchHub = (sections) => {
  const list = JSON.parse(JSON.stringify(Array.isArray(sections) ? sections : []));
  const stage = list.find((entry) => entry?.type === "stage_section" && entry.anchor === HUB_ANCHOR);
  if (!stage?.data) return null;
  const label = String(stage.data.secondary_cta_label ?? "").trim();
  const href = String(stage.data.secondary_cta_href ?? "").trim();
  if (label || href) return null;
  stage.data.secondary_cta_label = HUB_BUTTON;
  stage.data.secondary_cta_href = `/${PAGE_PATH}`;
  return list;
};

// The reverse of patchHub, only for a stage that still has exactly our button.
const unpatchHub = (sections) => {
  const list = JSON.parse(JSON.stringify(Array.isArray(sections) ? sections : []));
  const stage = list.find((entry) => entry?.type === "stage_section" && entry.anchor === HUB_ANCHOR);
  if (!stage?.data) return null;
  if (stage.data.secondary_cta_label !== HUB_BUTTON || stage.data.secondary_cta_href !== `/${PAGE_PATH}`) return null;
  stage.data.secondary_cta_label = "";
  stage.data.secondary_cta_href = "";
  return list;
};

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  const now = new Date();
  const done = { created: 0, replaced: 0, proposed: 0, skipped: 0, hub: 0 };
  const prepared = buildPages().map(prepare);

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) => sequelize.query(sql, { replacements, transaction, type: "SELECT" });
    const run = (sql, replacements = {}) => sequelize.query(sql, { replacements, transaction });

    const revision = (pageId, version, action, note, snapshot) =>
      queryInterface.bulkInsert(
        "site_page_revisions",
        [
          {
            id: randomUUID(),
            site_page_id: pageId,
            version,
            action,
            note,
            snapshot: JSON.stringify(snapshot),
            created_by: null,
            created_by_name: "Seeder",
            created_at: now,
          },
        ],
        { transaction },
      );

    // ── the new situation page ──
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
        await revision(id, 1, "publish", NOTE_INITIAL, snapshotOf(page));
        done.created++;
        continue;
      }

      const revisions = await select("SELECT note FROM site_page_revisions WHERE site_page_id = :id", { id: existing.id });
      if (revisions.some((entry) => MARKERS.includes(entry.note))) {
        done.skipped++;
        continue;
      }

      // Still exactly as first seeded: replace the sections and publish.
      if (existing.version === 1 && revisions.length <= 1 && existing.status === "published") {
        await run(
          `UPDATE site_pages SET
             template = :template, title = :title, h1 = :h1, meta_title = :meta_title, meta_description = :meta_description,
             sections = CAST(:sections AS jsonb), published_sections = CAST(:sections AS jsonb),
             published_meta = CAST(:meta AS jsonb), published_at = :now, version = 2,
             has_unpublished_changes = false, updated_at = :now
           WHERE id = :id`,
          {
            id: existing.id,
            template: page.template,
            ...metaOf(page),
            sections: JSON.stringify(page.sections),
            meta: JSON.stringify(metaOf(page)),
            now,
          },
        );
        await revision(existing.id, 2, "publish", NOTE_REPLACED, snapshotOf(page));
        done.replaced++;
        continue;
      }

      // Edited by someone: leave it alone, add the seeded layout to the history.
      await revision(existing.id, existing.version, "save", NOTE_PROPOSED, snapshotOf(page));
      done.proposed++;
    }

    // ── the Your Project hub: the second button of the Buying land stage ──
    const [hub] = await select(
      `SELECT id, version, sections, published_sections, title, h1, meta_title, meta_description, template
         FROM site_pages WHERE locale = 'en' AND path = :path`,
      { path: HUB_PATH },
    );
    if (hub) {
      const marked = await select("SELECT id FROM site_page_revisions WHERE site_page_id = :id AND note = :note", {
        id: hub.id,
        note: NOTE_HUB,
      });
      const draft = patchHub(hub.sections);
      const live = hub.published_sections ? patchHub(hub.published_sections) : null;
      if (marked.length || (!draft && !live)) {
        done.skipped++;
      } else {
        // Only an empty button is filled in, so no edit is overwritten.
        const nextVersion = hub.version + 1;
        await run(
          `UPDATE site_pages SET
             sections = CAST(:sections AS jsonb),
             published_sections = CASE WHEN :live::text IS NULL THEN published_sections ELSE CAST(:live AS jsonb) END,
             version = :version, updated_at = :now
           WHERE id = :id`,
          {
            id: hub.id,
            sections: JSON.stringify(draft ?? hub.sections),
            live: live ? JSON.stringify(live) : null,
            version: nextVersion,
            now,
          },
        );
        await revision(hub.id, nextVersion, "save", NOTE_HUB, {
          template: hub.template,
          locale: "en",
          path: HUB_PATH,
          title: hub.title,
          h1: hub.h1,
          meta_title: hub.meta_title,
          meta_description: hub.meta_description,
          translation_status: "missing",
          sections: draft ?? hub.sections,
        });
        done.hub++;
      }
    }
  });

  console.log(
    `✅ Buying land: ${done.created} created, ${done.replaced} replaced, ` +
      `${done.proposed} added to revision history (page was edited), ${done.skipped} already done, ` +
      `${done.hub} hub button added`,
  );
}

export async function down({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) => sequelize.query(sql, { replacements, transaction, type: "SELECT" });
    const run = (sql, replacements = {}) => sequelize.query(sql, { replacements, transaction });

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
      const [initial] = await select("SELECT id FROM site_page_revisions WHERE site_page_id = :id AND note = :note", {
        id: row.id,
        note: NOTE_INITIAL,
      });
      // Created by this seeder and never edited: remove the page (revisions go with it).
      if (initial && row.version === 1) {
        await run("DELETE FROM site_pages WHERE id = :id", { id: row.id });
      }
      // A page edited since, or replaced, is left as it is.
    }

    // The hub button: removed only while it is still exactly ours.
    const [hub] = await select(
      "SELECT id, version, sections, published_sections FROM site_pages WHERE locale = 'en' AND path = :path",
      { path: HUB_PATH },
    );
    if (hub) {
      const [marker] = await select("SELECT id FROM site_page_revisions WHERE site_page_id = :id AND note = :note", {
        id: hub.id,
        note: NOTE_HUB,
      });
      if (marker) {
        const draft = unpatchHub(hub.sections);
        const live = hub.published_sections ? unpatchHub(hub.published_sections) : null;
        if (draft || live) {
          await run(
            `UPDATE site_pages SET
               sections = CAST(:sections AS jsonb),
               published_sections = CASE WHEN :live::text IS NULL THEN published_sections ELSE CAST(:live AS jsonb) END,
               updated_at = :now
             WHERE id = :id`,
            {
              id: hub.id,
              sections: JSON.stringify(draft ?? hub.sections),
              live: live ? JSON.stringify(live) : null,
              now: new Date(),
            },
          );
        }
        await run("DELETE FROM site_page_revisions WHERE id = :id", { id: marker.id });
      }
    }
  });
  console.log("⚠️  Rolled back: Buying land page (a page edited since was left as it is)");
}
