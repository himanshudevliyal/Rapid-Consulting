// seeders/20261029100003-seed-managed-pages.js
// Round 3, batch 3 (29 October 2026): the website's own pages become pages of
// the page builder, so every word of them can be edited in the dashboard.
//
//   Template "managed", one page per path:
//     about          Figma 1501-77607
//     contact        Figma 1538-84837
//     resources      Figma 1292-58851
//     schemes        Figma 1660-96044 (the scheme directory)
//     case-studies   Figma 1677-96674 (the case archive)
//     home           Figma 519-3479 (option A)
//     how-we-work    no Figma transcription yet: the page's existing website
//                    text, section by section.
//
// The website keeps drawing these pages with its own views (forms, the live
// scheme list, the case grid ...); the views take their text from the page's
// sections. The block and field contract is in doc/MANAGED-CONTRACT.md.
//
// Copy. The Figma wireframe text (Rapid-approved) is used word for word.
// Spec reference tags in the transcriptions ([S2], [AB2], [K6] ...) are not
// text and are left out. Anything the transcription marks as off-screen,
// unseen or unreadable, and every placeholder token (XX, X.X, [date], [name],
// [Name], [Role]) is left EMPTY, never invented: the website then hides the
// field or shows its own placeholder. Where a figure in a template line is
// computed by the website, the line carries a token ({shown}, {total}).
// "Draft case" and "Portrait placeholder" are the design's own wording.
//
// Links go only to pages that exist (hubs, the scheme and case lists, the
// scheme directory); a link the Figma shows but the site cannot resolve yet
// is left empty.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100003-seed-managed-pages
//
// Safe to run again, and it never overwrites an editor's work:
//   - a page that is still exactly as first seeded (version 1, one revision)
//     is replaced and published as the next version;
//   - a page that has been edited is left alone; the seeded text is added to
//     its revision history ("Figma content ...") so an editor can restore it;
//   - a page already handled by this seeder is skipped.
// After running, save or publish a page in the dashboard (or wait for the
// website's revalidate interval) to refresh the website cache.

import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { makeSection, normaliseSections } from "../app/helpers/site-page-registry.js";

const howWeWork = JSON.parse(fs.readFileSync(new URL("./data/how-we-work-a02.json", import.meta.url), "utf8"));

const NOTE_INITIAL = "Figma content (seeded)";
const NOTE_REPLACED = "Figma content (seeded, replaces the first seeded sections)";
const NOTE_PROPOSED = "Figma content (seeded). Restore this revision to use it";
const MARKERS = [NOTE_INITIAL, NOTE_REPLACED, NOTE_PROPOSED];

// ── Builders ──────────────────────────────────────────────────────────────

// A section. `anchor` is the stable key the website's views look it up by.
const sec = (type, anchor, label, data, variant) =>
  makeSection(type, { anchor, label, ...(variant ? { variant } : {}), data });

const rows = (...pairs) => pairs.map(([label, text, href = ""]) => ({ label, text, href }));
const texts = (...values) => values.map((text) => ({ text }));
const bc = (...pairs) => pairs.map(([label, href = ""]) => ({ label, href }));

const WA_LABEL = "WhatsApp +91 94672 48028";
const DISCUSS = "Discuss your project";

// The wording shared by the enquiry cards.
const CONSENT = "Rapid may contact me by phone or WhatsApp about this enquiry.";
const FORM_COMMON = {
  badge_text: "FREE / FIRST REVIEW",
  name_label: "Your name",
  name_placeholder: "Your full name",
  phone_label: "Mobile number",
  phone_placeholder: "10 digits",
  district_label: "District",
  district_placeholder: "e.g. Hisar",
  required_label: "Required",
  optional_label: "Optional",
  consent_label: CONSENT,
  helper: "A Rapid expert will call you.",
  whatsapp_label: "Chat with Rapid on WhatsApp",
};

const logos = (count = 8) =>
  sec("logo_strip", "clients", "Our clients", { eyebrow: "OUR CLIENTS", heading: "Businesses that trust Rapid.", count });

// The three sample review cards used by About, Home and the case archive.
const REVIEW_ITEMS = [
  {
    quote: "Rapid brought the paperwork, our CA and the bank onto one clear plan. We always knew what was needed next.",
    name: "",
    business: "",
    location: "Hisar, Haryana",
    rating: "5",
    services: texts("Subsidy advisory", "Project finance"),
  },
  {
    quote:
      "The team explained what was needed at every stage. One point of contact made the paperwork and follow-ups much easier.",
    name: "",
    business: "",
    location: "Panipat, Haryana",
    rating: "5",
    services: texts("Consent to Establish", "Fire NOC"),
  },
  {
    quote: "Rapid brought our CA, bank and machinery supplier onto the same page. We knew which documents were needed next.",
    name: "",
    business: "",
    location: "Sonipat, Haryana",
    rating: "5",
    services: texts("Project finance", "Subsidy advisory"),
  },
];
const reviews = (data) =>
  sec("reviews_carousel", "reviews", "Client reviews", {
    rating_label: "Overall rating",
    rating_value: "",
    rating_count: "",
    rating_source: "",
    trust_label: "TRUSTED BY GROWING BUSINESSES",
    services_label: "SERVICES TAKEN",
    items: REVIEW_ITEMS,
    cta_label: "View all reviews",
    cta_href: "",
    ...data,
  });

// ── Pages ─────────────────────────────────────────────────────────────────

const aboutPage = () => ({
  page_key: "pg_mgdabout",
  template: "managed",
  locale: "en",
  path: "about",
  title: "About Rapid",
  h1: "About Rapid Consulting",
  meta_title: "About Rapid Consulting | Hisar, Haryana",
  meta_description:
    "Meet Rapid Consulting, a Hisar-based advisory firm supporting business investments, subsidies, approvals and related project requirements across Haryana.",
  sections: [
    sec("page_hero", "hero", "Hero", {
      breadcrumb: bc(["Home", "/"], ["About"]),
      eyebrow: "ABOUT RAPID",
      heading: "From a piece of land to a running factory, with one owner for every file.",
      intro:
        "Rapid Consulting is based in Hisar and carries industrial projects across Haryana: land, approvals, subsidies, finance and insurance, as one project.",
      primary_label: DISCUSS,
      secondary_label: WA_LABEL,
      card_kind: "rows",
      card_title: "Rapid at a glance",
      card_rows: rows(
        ["Based in", "Hisar, Haryana"],
        ["Working since", "2011"],
        ["The team", "48 people: CAs, company secretaries, liaison and engineers"],
        ["What we cover", "Land and CLU, approvals, subsidies, finance, insurance, licences"],
        ["How you start", "A free first check, in writing"],
        ["Every file", "One point person and a shared checklist"],
      ),
    }),
    logos(8),
    sec("data_table", "why-one-owner", "Why one owner", {
      eyebrow: "WHY ONE OWNER",
      heading: "Five ways an industrial project goes wrong when nobody owns all of it.",
      columns: texts("What goes wrong", "What it costs", "Who stops it"),
      rows: [
        {
          cell_1: "The land is bought, then the approval restrictions surface.",
          cell_2: "The plot can't take your unit, or costs far more to convert.",
          cell_3: "A Land Check before the token, then CLU",
          link_href: "",
        },
        {
          cell_1: "The building is ready, but one approval isn't.",
          cell_2: "Production waits while the interest runs.",
          cell_3: "Approvals in the right order",
          link_href: "/approvals",
        },
        {
          cell_1: "The bank loan is delayed.",
          cell_2: "The project stalls between plan and spend.",
          cell_3: "A report the bank can test",
          link_href: "/finance-and-insurance",
        },
        {
          cell_1: "A planning mistake loses the subsidy.",
          cell_2: "Money you counted on doesn't come.",
          cell_3: "Eligibility checked before you invest",
          link_href: "/subsidies",
        },
        {
          cell_1: "Separate consultants, and nobody responsible.",
          cell_2: "Every step waits on someone else.",
          cell_3: "One owner for the whole sequence",
          link_href: "/how-we-work",
        },
      ],
      closing_text: "A wrong decision before you invest can cost far more than the advice.",
      cta_label: DISCUSS,
    }),
    sec(
      "feature_cards",
      "what-we-do",
      "What we do",
      {
        eyebrow: "WHAT WE DO",
        heading: "Six kinds of work, carried as one project.",
        // Cards 5 and 6 are off-screen in the prototype: not seeded.
        items: [
          { title: "Land and CLU", text: "Check the plot before the token, then we handle the CLU application." },
          { title: "Statutory approvals", text: "Every approval your factory needs, in the right order.", href: "/approvals" },
          {
            title: "Subsidies and incentives",
            text: "The right scheme for each cost, followed through to payment.",
            href: "/subsidies",
          },
          {
            title: "Project reports and finance",
            text: "A project report written for the bank and the scheme together.",
            href: "/finance-and-insurance",
          },
        ],
        cta_label: "Find your starting point",
        cta_href: "/your-project",
      },
      "carousel",
    ),
    sec("team_cards", "people", "The people", {
      eyebrow: "THE PEOPLE",
      heading: "The team behind your file.",
      items: [
        {
          initials: "AG",
          caption: "Portrait placeholder",
          tag: "LEADERSHIP",
          name: "Atul Goyal",
          role: "Founder, Rapid Consulting",
          detail: "",
          href: "",
          link_label: "View profile",
        },
        {
          initials: "AR",
          caption: "Portrait placeholder",
          tag: "SAMPLE",
          name: "Ananya Rao",
          role: "Land and approvals lead",
          detail: "Chartered Accountant",
          href: "",
          link_label: "View profile",
        },
        { initials: "", caption: "Portrait placeholder", tag: "EXPERTS", name: "", role: "", detail: "", href: "", link_label: "" },
        { initials: "", caption: "Portrait placeholder", tag: "EXPERTS", name: "", role: "", detail: "", href: "", link_label: "" },
      ],
      footer_text: "48 people across CA, company secretary, liaison and engineering roles.",
      cta_label: "Meet Atul Goyal",
      cta_href: "",
    }),
    sec("steps", "how-we-work", "How we work", {
      eyebrow: "HOW WE WORK",
      heading: "Assessment before quotation. An owner for every file.",
      items: [
        { title: "Listen.", text: "A 20-minute call: what, where, by when, and with what budget." },
        {
          title: "Assess.",
          text: "A free first check, in writing: a Land Check, an eligibility check or an approval roadmap.",
        },
        { title: "Propose.", text: "The scope, exclusions and timeline, with our fees and government charges shown apart." },
        { title: "Onboard.", text: "One point person, one group and one checklist." },
        { title: "Execute.", text: "Every stage has a date and an owner, and you see who acts next." },
        { title: "Deliver and stay.", text: "After the sanction or licence come renewals, claims and expansion." },
      ],
      cta_label: "See how we work",
      cta_href: "/how-we-work",
    }),
    sec("case_cards", "client-success", "Client success", {
      eyebrow: "CLIENT SUCCESS",
      heading: "Work we've done for owners like you.",
      items: [
        {
          panel_label: "DRAFT CASE",
          amount: "₹16.5 lakh",
          caption: "Equipment spend, not subsidy received",
          title: "Testing equipment for an agro processor, Sirsa",
          rows: [
            { label: "Scheme", value: "Testing equipment subsidy", href: "/schemes/testing-machine-subsidy" },
            { label: "Industry", value: "Food and agro", href: "" },
            { label: "Location", value: "Sirsa, Haryana", href: "" },
          ],
          cta_label: "See how Rapid helped",
        },
        {
          panel_label: "DRAFT CASE",
          amount: "₹30 lakh",
          caption: "Equipment spend, not subsidy received",
          title: "Safety equipment for an agro processor, Hisar",
          rows: [
            { label: "Scheme", value: "Fire equipment subsidy", href: "/schemes/fire-equipment-subsidy" },
            { label: "Industry", value: "Food and agro", href: "" },
            { label: "Location", value: "Hisar, Haryana", href: "" },
          ],
          cta_label: "See how Rapid helped",
        },
        {
          panel_label: "DRAFT CASE",
          amount: "₹49 lakh",
          caption: "Project investment, not subsidy received",
          title: "Capital subsidy for a manufacturing unit, Hisar",
          rows: [
            { label: "Scheme", value: "HGUVY capital subsidy", href: "/schemes/hguvy-scheme" },
            { label: "Industry", value: "Engineering and materials", href: "" },
            { label: "Location", value: "Hisar, Haryana", href: "" },
          ],
          cta_label: "See how Rapid helped",
        },
      ],
      cta_label: "View all case studies",
      cta_href: "/case-studies",
    }),
    sec("faq_accordion", "faqs", "FAQs", {
      eyebrow: "FAQs",
      heading: "Before you call us.",
      items: [
        {
          question: "What do you charge?",
          answer_html:
            "<p>Your first check is free. After it, we quote our fee for the work you choose, with the government fees listed separately. You know both before any work starts.</p>",
        },
        { question: "Can you take over a file another consultant started?", answer_html: "" },
        { question: "I already have a CA, architect or banker. Can they work with you?", answer_html: "" },
        { question: "Do you guarantee the outcome?", answer_html: "" },
        { question: "What happens after I request a callback?", answer_html: "" },
      ],
      cta_label: "View all FAQs",
      cta_href: "/faqs",
    }),
    sec("info_panel", "visit-us", "Visit us", {
      eyebrow: "VISIT US",
      heading: "Our office in Hisar.",
      lines: [
        { label: "Address", text: "1st Floor, 134, Lajpat Nagar, Old Court Road, Hisar, Haryana 125001", href: "" },
        { label: "Phone and WhatsApp", text: "+91 94672 48028", href: "tel:+919467248028" },
        { label: "Email", text: "info@rapidconsulting.in", href: "mailto:info@rapidconsulting.in" },
        // The hours are not given in the design ("[days and hours]").
        { label: "Hours", text: "", href: "" },
      ],
      cta_label: "Get directions",
      cta_href: "",
      panel_label: "OFFICE PHOTO / MAP PLACEHOLDER",
      panel_title: "The Rapid office, Old Court Road, Hisar",
      panel_note: "",
    }),
    reviews({
      eyebrow: "CLIENT EXPERIENCES",
      heading: "In our clients' words.",
      intro: "What it feels like to have Rapid on your side.",
    }),
    sec("closing_panel", "closing", "Closing enquiry panel", {
      ...FORM_COMMON,
      eyebrow: "NEXT STEP",
      heading: "Tell us what you're planning. We'll tell you what applies, before you spend.",
      form_title: "Tell us about your project.",
      select_label: "Where is your project?",
      select_required: true,
      select_placeholder: "Not sure",
      activity_label: "What are you working on?",
      activity_placeholder: "e.g. A food processing unit",
      submit_label: "Get my next steps",
    }),
  ],
});

const contactPage = () => ({
  page_key: "pg_mgdcontact",
  template: "managed",
  locale: "en",
  path: "contact",
  title: "Contact",
  h1: "Talk to us about your project.",
  meta_title: "Discuss Your Project | Rapid Consulting, Hisar",
  meta_description:
    "Talk to Rapid Consulting about your Haryana project. WhatsApp +91 94672 48028 or request a callback from an expert consultant.",
  sections: [
    sec("page_hero", "hero", "Hero", {
      ...FORM_COMMON,
      breadcrumb: bc(["Home", "/"], ["Contact"]),
      eyebrow: "CONTACT",
      heading: "Talk to us about your project.",
      intro: "Start with a short description. You don't need the exact service name or a full set of papers.",
      links: [
        { label: "Call or WhatsApp: +91 94672 48028", href: "tel:+919467248028" },
        { label: "Email: info@rapidconsulting.in", href: "mailto:info@rapidconsulting.in" },
      ],
      plain_text: "Office: Old Court Road, Hisar",
      secondary_label: "Chat with Rapid on WhatsApp",
      card_kind: "form",
      card_title: "Get a free first check.",
      select_label: "Where is your project?",
      select_placeholder: "Not sure",
      activity_label: "What are you working on?",
      activity_placeholder: "e.g. A food processing unit",
      submit_label: "Get my next steps",
    }),
  ],
});

const BY_STAGE_ITEMS = [
  {
    tag: "GUIDE",
    kicker: "BUYING LAND",
    title: "Before buying or leasing land: check the proposed use",
    text: "What to confirm about zone, access and use before you commit.",
    meta: "4 min read",
    cta_label: "Read the guide",
  },
  {
    tag: "GUIDE",
    kicker: "SETTING UP",
    title: "Change of Land Use in Haryana: approval and preparation guide",
    text: "Every step of CLU, and the full document list.",
    meta: "8 min read",
    cta_label: "Read the guide",
  },
  {
    tag: "GUIDE",
    kicker: "RUNNING",
    title: "Renewals: what's due, and when",
    text: "The consents and licences a running unit renews, and how often.",
    meta: "Guide in preparation",
    note: "Placeholder",
    cta_label: "Read the guide",
  },
  {
    tag: "ARTICLE",
    kicker: "EXPANDING",
    title: "Subsidy for a new unit or an expansion: why the distinction matters",
    text: "What changes for a subsidy when you expand, and what to check first.",
    meta: "4 min read",
    cta_label: "Read the article",
  },
  {
    tag: "GUIDE",
    kicker: "FUNDING",
    title: "Documents required for a business loan: build a lender-ready file",
    text: "The papers a lender asks for, in one file.",
    meta: "6 min read",
    cta_label: "Read the guide",
  },
];

// [title, Guide|Article, topic, reading time]
const BY_TOPIC = [
  ["Change of Land Use in Haryana: approval and preparation guide", "Guide", "Land and CLU", "8 min read"],
  ["Fire NOC in Haryana: a practical guide for industrial buildings", "Guide", "Approvals", "5 min read"],
  ["Before buying or leasing land: check the proposed use", "Guide", "Land and CLU", "4 min read"],
  ["Seven subsidy application mistakes and how to avoid them", "Guide", "Subsidies", "6 min read"],
  ["Preparing for a manufacturing-subsidy discussion", "Guide", "Subsidies", "5 min read"],
  ["Documents required for a business loan: build a lender-ready file", "Guide", "Finance", "6 min read"],
  ["What should a CLU consultant coordinate for your Haryana project?", "Article", "Land and CLU", "4 min read"],
  ["Fire NOC and fire licence: ask for the exact approval", "Article", "Approvals", "4 min read"],
  ["Subsidy for a new unit or an expansion: why the distinction matters", "Article", "Subsidies", "4 min read"],
  ["Already invested? How to check whether a subsidy claim is still possible", "Article", "Subsidies", "4 min read"],
  ["CGTMSE loans: what collateral-free finance actually means", "Article", "Finance", "4 min read"],
  ["MSME finance: choose between a loan, guarantee and subsidy", "Article", "Finance", "3 min read"],
].map(([title, tag, topic, meta]) => ({ title, tag, topic, meta, extra: "", pill: "", href: "" }));

const resourcesPage = () => ({
  page_key: "pg_mgdresources",
  template: "managed",
  locale: "en",
  path: "resources",
  title: "Resources",
  h1: "A wrong plot, a missed date, a weak report. Each one costs money.",
  meta_title: "",
  meta_description: "",
  sections: [
    sec("page_hero", "hero", "Hero", {
      breadcrumb: bc(["Home", "/"], ["Resources"]),
      eyebrow: "RESOURCES",
      heading: "A wrong plot, a missed date, a weak report. Each one costs money.",
      intro: "Practical guides on land, approvals, subsidies and finance in Haryana, written by the people who file them.",
      primary_label: DISCUSS,
      secondary_label: WA_LABEL,
      nav_label: "Find answers:",
      card_kind: "search",
      card_title: "What do you need to know?",
      search_label: "Search",
      search_placeholder: "Search guides, articles and schemes",
      search_button: "Search",
      popular_label: "Popular questions",
      card_rows: rows(
        ["Can farmland take a factory?", ""],
        ["Which fire NOC does my building need?", ""],
        ["What do lenders ask for?", ""],
        ["Which subsidy mistakes cost the most?", ""],
      ),
    }),
    sec(
      "feature_cards",
      "by-stage",
      "By stage",
      {
        eyebrow: "BY STAGE",
        heading: "Not sure where to begin? Start where your project is.",
        items: BY_STAGE_ITEMS,
        cta_label: "See every stage on Your Project",
        cta_href: "/your-project",
      },
      "carousel",
    ),
    sec("directory", "by-topic", "By topic", {
      eyebrow: "BY TOPIC",
      heading: "Every guide and article, by topic.",
      search_label: "Search",
      search_placeholder: "Search guides, articles and schemes",
      search_button: "Search",
      groups: [
        {
          label: "",
          chips: texts(
            "Land and CLU",
            "Approvals",
            "Subsidies",
            "Finance",
            "Planning your project",
            "Registrations",
            "Business setup",
          ),
        },
      ],
      all_label: "All",
      count_template: "{total} featured guides and articles",
      items: BY_TOPIC,
      cta_label: "View all articles",
      cta_href: "/articles",
    }),
    sec("banner", "schemes", "Schemes", {
      eyebrow: "SCHEMES",
      heading: "Over 50 subsidy schemes, each with its own page.",
      text: "Search by name, or filter by what the subsidy pays back.",
      primary_label: "Find a subsidy",
      primary_href: "/schemes",
      secondary_label: "Browse the scheme directory",
      secondary_href: "/schemes",
      tone: "navy",
    }),
    sec("feature_cards", "learn-live", "Learn live", {
      eyebrow: "LEARN AND STAY UPDATED",
      heading: "Learn with other owners, and hear about changes first.",
      items: [
        {
          tag: "LIVE SESSIONS",
          title: "Live sessions and recordings.",
          text: "Short sessions on approvals and subsidies, with time for your questions. Recordings stay available.",
          note: "Details to be confirmed · Placeholder",
          cta_label: "See upcoming sessions",
        },
        {
          tag: "WHATSAPP COMMUNITY",
          title: "Rapid's WhatsApp community.",
          text: "Policy changes and scheme windows, shared as they happen.",
          note: "Details to be confirmed · Placeholder",
          cta_label: "Join the community",
        },
        {
          tag: "FOR CAs AND BANKERS",
          title: "For CAs, bankers and advisers.",
          text: "Guides to share with clients, and how to bring us in on a project.",
          cta_label: "See the adviser page",
          href: "/advisers",
        },
      ],
    }),
    sec("faq_accordion", "faqs", "FAQs", {
      eyebrow: "FAQs",
      heading: "Questions owners ask us.",
      items: [
        {
          question: "Is there a minimum land area for CLU in Haryana?",
          answer_html:
            "<p>For industry, usually not. Size rarely stops you: there's no minimum in the industrial or farmland zones. The plan's transport zone needs at least 0.5 acre, and farmland within 2 km of a medium-potential town is capped at 5 acres. On farmland around the biggest towns, factories aren't allowed at all.</p>",
        },
        { question: "How long do approvals take?", answer_html: "" },
        { question: "How much subsidy will I get?", answer_html: "" },
        { question: "Can I get a loan without collateral?", answer_html: "" },
        { question: "Do you guarantee the outcome?", answer_html: "" },
      ],
      cta_label: "View all FAQs",
      cta_href: "/faqs",
    }),
    sec("closing_panel", "closing", "Closing enquiry panel", {
      ...FORM_COMMON,
      eyebrow: "NEXT STEP",
      heading: "Read enough? Ask us.",
      form_title: "Tell us your question.",
      select_label: "What's it about?",
      select_required: true,
      select_placeholder: "Not sure yet",
      activity_label: "Your question",
      activity_placeholder: "e.g. Can my plot get CLU?",
      submit_label: "Get an answer",
    }),
  ],
});

const STATUS_LEGEND = [
  ["Open", "New applications are being taken. Checked on the date shown."],
  [
    "Policy changed",
    "Haryana's policy changed on 29 July 2026. Which rules and claim dates apply depends on when you invested.",
  ],
  ["Existing claims only", "No new applications, but claims already under way can continue."],
  ["Being checked", "We're confirming the current position. Ask us before you invest on the strength of it."],
  ["Discontinued", "No longer accepting applications. Read the scheme page for details."],
].map(([tag, text]) => ({ tag, title: tag, text }));

const schemesPage = () => ({
  page_key: "pg_mgdschemes",
  template: "managed",
  locale: "en",
  path: "schemes",
  title: "Scheme directory",
  h1: "The scheme you read about may have closed, or changed.",
  meta_title: "",
  meta_description: "",
  sections: [
    sec("page_hero", "hero", "Hero", {
      breadcrumb: bc(["Home", "/"], ["Subsidies", "/subsidies"], ["Scheme directory"]),
      eyebrow: "SCHEME DIRECTORY",
      heading: "The scheme you read about may have closed, or changed.",
      intro: "Find central and Haryana schemes for your business, and check their current status.",
      primary_label: DISCUSS,
      secondary_label: WA_LABEL,
      card_kind: "search",
      card_title: "Find a scheme.",
      search_label: "Search by scheme, short name or expense",
      search_placeholder: "e.g. CGTMSE, AIF, stamp duty, machinery",
      search_button: "Search",
      popular_label: "Popular:",
      chips: [
        { label: "CGTMSE", term: "CGTMSE" },
        { label: "AIF", term: "AIF" },
        { label: "MSE-CDP", term: "MSE-CDP" },
        { label: "NHB", term: "NHB" },
        { label: "Warehousing", term: "Warehousing" },
      ],
    }),
    // The schemes themselves come from the scheme list; only the wording is here.
    sec("directory", "all-schemes", "All schemes", {
      eyebrow: "ALL SCHEMES",
      // {total} is replaced by the website with the number of schemes.
      heading: "{total} schemes, each with its status.",
      groups: [
        {
          label: "What it pays back:",
          chips: texts("On your investment", "On your loan", "While you run", "For your sector"),
        },
        {
          label: "Industry or sector:",
          chips: texts(
            "Food and agro",
            "Engineering and materials",
            "Recycling and biofuel",
            "Commercial and logistics",
            "Textile",
            "Electric vehicles",
            "Exporters",
            "Clusters",
          ),
        },
      ],
      all_label: "All",
      clear_label: "Clear",
      count_template: "Showing {shown} of {total} schemes",
      more_label: "Show more",
    }),
    sec("feature_cards", "status-legend", "Reading a status", {
      eyebrow: "READING A STATUS",
      heading: "What each status means.",
      items: STATUS_LEGEND,
    }),
    sec("banner", "policy-change", "Haryana policy change", {
      eyebrow: "HARYANA POLICY CHANGE",
      heading: "Haryana's policy changed on 29 July 2026.",
      text: "The Progressive MSME & Export Promotion Policy 2026 replaced HEEP 2020 and the 2019 MSME policy. If you invested, or planned to claim, under the old policies, we'll check which rules and claim dates apply to your investment.",
      primary_label: "Check my claim",
      tone: "navy",
    }),
    sec("directory", "also-in-directory", "Also in the directory", {
      eyebrow: "ALSO IN THE DIRECTORY",
      heading: "Two more, kept for searches.",
      items: [
        {
          title: "MoFPI Backward and Forward Linkages: Discontinued Scheme",
          tag: "",
          topic: "",
          meta: "Central · For your sector",
          extra: "",
          pill: "Being checked",
          href: "",
        },
        {
          title: "Purchase Incentives for Electric Vehicle Buyers in Haryana",
          tag: "",
          topic: "",
          meta: "Haryana · For your sector · Electric vehicles · For vehicle buyers, not factories",
          extra: "",
          pill: "Being checked",
          href: "",
        },
      ],
    }),
    sec("faq_accordion", "faqs", "Common questions", {
      eyebrow: "COMMON QUESTIONS",
      heading: "Common questions about schemes",
      items: [
        { question: "Can I invest before applying?", answer_html: "" },
        { question: "Can I claim two schemes together?", answer_html: "" },
        { question: "Which policy applies to me?", answer_html: "" },
        { question: "Is Udyam registration enough?", answer_html: "" },
        { question: "Do you guarantee the subsidy?", answer_html: "" },
      ],
      cta_label: "View all FAQs",
      cta_href: "/faqs",
    }),
    sec("closing_panel", "closing", "Closing enquiry panel", {
      ...FORM_COMMON,
      eyebrow: "NEXT STEP",
      heading: "Not sure which scheme fits?",
      photo_note: "Placeholder: a factory site in Haryana. Licensed or commissioned, labelled as representative.",
      form_title: "Tell us what you're investing in.",
      select_label: "What do you need?",
      select_required: true,
      select_placeholder: "Not sure yet",
      activity_label: "Your unit",
      activity_placeholder: "e.g. A food processing unit",
      submit_label: "Check my subsidy route",
    }),
  ],
});

const caseItem = (panel, amount, status, title, scheme, schemeHref, industry, location) => ({
  panel_label: panel,
  amount,
  caption: "",
  status,
  title,
  rows: [
    { label: "Scheme", value: scheme, href: schemeHref },
    { label: "Industry", value: industry, href: "" },
    { label: "Location", value: location, href: "" },
  ],
  cta_label: "See how Rapid helped",
});

const caseArchivePage = () => ({
  page_key: "pg_mgdcases",
  template: "managed",
  locale: "en",
  path: "case-studies",
  title: "Case studies",
  h1: "A subsidy claim rests on its records. Here's how we built these files.",
  meta_title: "",
  meta_description: "",
  sections: [
    sec("page_hero", "hero", "Hero", {
      breadcrumb: bc(["Home", "/"], ["Work / Case studies"]),
      eyebrow: "CASE STUDIES",
      heading: "A subsidy claim rests on its records. Here's how we built these files.",
      intro: "Anonymous case studies from Haryana: the investment, what Rapid handled, and where each file stands.",
      primary_label: DISCUSS,
      secondary_label: WA_LABEL,
      card_kind: "rows",
      card_title: "What every case shows",
      card_rows: rows(
        ["The investment:", "what the unit spent, not the subsidy"],
        ["What Rapid handled:", "the records, the application and the follow-up"],
        ["Where it stands:", "filed, sanctioned or paid, as confirmed"],
      ),
    }),
    sec("case_cards", "all-cases", "All cases", {
      eyebrow: "ALL CASES",
      heading: "Cases like yours.",
      filter_label: "Industry:",
      all_label: "All",
      filters: texts("Food and agro", "Engineering and materials"),
      count_template: "Showing {shown} of {total} cases",
      items: [
        caseItem(
          "DRAFT CASE · EQUIPMENT SPEND",
          "About ₹16.5 lakh",
          "Application filed",
          "Testing equipment for an agro processor, Sirsa",
          "Testing equipment subsidy",
          "/schemes/testing-machine-subsidy",
          "Food and agro",
          "Sirsa, Haryana",
        ),
        caseItem(
          "DRAFT CASE · EQUIPMENT SPEND",
          "About ₹30 lakh",
          "Application filed",
          "Safety equipment for an agro processor, Hisar",
          "Fire and safety equipment assistance",
          "/schemes/fire-equipment-subsidy",
          "Food and agro",
          "Hisar, Haryana",
        ),
        caseItem(
          "DRAFT CASE · MACHINERY AND BUILDING INVESTMENT",
          "About ₹49 lakh",
          "Application filed",
          "Capital subsidy for a manufacturing unit, Hisar",
          "Explore investment subsidies",
          "/subsidies",
          "Engineering and materials",
          "Hisar, Haryana",
        ),
      ],
      footnote:
        "Clients stay anonymous: we name the district and the industry, never the business, unless the client agrees. Amounts are approximate, from each unit's records.",
    }),
    reviews({
      eyebrow: "CLIENT REVIEWS",
      heading: "What it feels like to have Rapid on your side.",
    }),
    sec("closing_panel", "closing", "Closing enquiry panel", {
      ...FORM_COMMON,
      eyebrow: "NEXT STEP",
      heading: "Have a similar investment? Tell us about it.",
      intro: "Your first check is free.",
      photo_note: "A FACTORY FLOOR IN HARYANA",
      form_title: "Tell us what you're investing in.",
      select_label: "What do you need?",
      select_required: true,
      select_placeholder: "Not sure yet",
      activity_label: "Your unit",
      activity_placeholder: "e.g. A food processing unit",
      submit_label: "Check my subsidy route",
    }),
  ],
});

const plainText = (value) =>
  String(value ?? "")
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .trim();

// No Figma transcription yet: the page's existing website text.
const howWeWorkPage = () => ({
  page_key: "pg_mgdhowwework",
  template: "managed",
  locale: "en",
  path: "how-we-work",
  title: howWeWork.title,
  h1: howWeWork.h1,
  meta_title: howWeWork.metaTitle,
  meta_description: howWeWork.description,
  sections: [
    sec("page_hero", "hero", "Hero", {
      breadcrumb: bc(["Home", "/"], ["How we work"]),
      heading: howWeWork.h1,
      intro: plainText(howWeWork.introHtml),
    }),
    ...howWeWork.sections.map((entry, index) =>
      sec("rich_text", `section-${index + 1}`, `Section ${index + 1}`.slice(0, 40), {
        heading: entry.title,
        html: entry.html,
      }),
    ),
  ],
});

const homePage = () => ({
  page_key: "pg_mgdhome",
  template: "managed",
  locale: "en",
  path: "home",
  title: "Home",
  h1: "Approvals and subsidies. One team, start to finish.",
  meta_title: "",
  meta_description: "",
  sections: [
    sec("page_hero", "hero", "Hero", {
      ...FORM_COMMON,
      eyebrow: "APPROVALS & SUBSIDIES FOR YOUR BUSINESS",
      heading: "Approvals and subsidies. One team, start to finish.",
      intro: "From land and approval checks to subsidy applications and payment follow-ups, Rapid handles the work.",
      bullets: [
        { title: "End-to-end expert support", text: "From pre-application checks to approvals and disbursements." },
        { title: "95% success rate*", text: "Serving MSMEs and industrial businesses across Haryana." },
        {
          title: "On-time execution",
          text: "Clear processes, a client panel and proactive follow-ups keep your project on track.",
        },
      ],
      footnote: "*In the last 11 years, across industries in Haryana.",
      card_kind: "form",
      card_eyebrow: "THE FIRST CHECK IS ON US",
      card_title: "Know what your project needs before you begin.",
      card_text: "Choose approval or subsidy to get started.",
      badge_text: "95% / SUCCESS RATE",
      form_tabs: [
        { label: "Approval check", submit_label: "Request an approval check" },
        // The subsidy button wording is not visible in the design.
        { label: "Subsidy check", submit_label: "" },
      ],
      name_placeholder: "Enter your name",
      phone_placeholder: "10-digit mobile number",
      location_label: "Site location / village",
      location_placeholder: "Village, town or area",
      activity_label: "Proposed business activity",
      activity_placeholder: "e.g. Food processing or manufacturing",
      form_error: "Allow phone or WhatsApp contact to request your check.",
      helper: "",
      whatsapp_label: "",
    }),
    sec("stats_strip", "numbers", "Rapid, in numbers", {
      heading: "Rapid, in numbers.",
      // The figures are XX in the design: left empty until Rapid supplies them.
      items: [
        { value: "", label: "Years in Business" },
        { value: "", label: "Projects Delivered" },
        { value: "", label: "Businesses Supported" },
      ],
      panel_value: "",
      panel_label: "Subsidies & Incentives Disbursed",
    }),
    sec("tabs_panel", "services", "What we can do", {
      eyebrow: "WHAT WE CAN DO FOR YOU",
      heading: "Know what you need? Choose a service.",
      intro:
        "Explore approvals, subsidies, finance and insurance support for your business. Choose what you need, and let Rapid help with the next step.",
      tab_layout: "top",
      tabs: [
        {
          label: "Approvals",
          title: "The approvals to build and run your unit.",
          text: "Buying land, setting up a new unit or expanding? Start with the land and approval checks. We prepare the documents, file the applications and follow up.",
          // The fifth card and later ones are cut off in the design: not seeded.
          cards: [
            { title: "Land & site checks", text: "Buying a plot?", hint: "Check its fit before you commit.", href: "" },
            { title: "Change of Land Use (CLU)", text: "Changing the land's use?", hint: "Know the approval route first.", href: "" },
            { title: "Building plan approval", text: "Ready to build?", hint: "Check plans before work starts.", href: "" },
            { title: "Consent to Establish (CTE)", text: "Setting up or expanding?", hint: "Prepare your pollution consent.", href: "" },
          ],
          cta_label: "Request an approval check",
        },
        // The content of these two tabs is not visible in the design.
        { label: "Subsidies & Incentives" },
        { label: "Finance & Insurance" },
      ],
      footer_text: "Also need certification or other business support?",
      footer_cta_label: "View all services",
      footer_cta_href: "/services",
    }),
    sec("tabs_panel", "your-project", "Your project", {
      eyebrow: "YOUR PROJECT",
      heading: "Not sure where to start? Let Rapid's experts guide you.",
      intro:
        "Buying land, ordering machinery or chasing a stuck file? Rapid experts will check your case and get your project moving in no time. The first check is on us.",
      tab_layout: "side",
      tabs: [
        {
          label: "Buying land",
          title: "Buying land",
          chips: texts(
            "Can I use this land for my planned industry?",
            "Will I get CLU approval for this plot?",
            "What should I check before paying a token or signing the registry?",
          ),
          note_label: "How Rapid helps",
          note_text:
            "Rapid checks your plot and land records against your proposed activity, so you know the approval route before committing.",
          callout: "A plot can't be changed after registry. Get a 48-hour check first.",
          cta_label: "Request a land check",
        },
        // The content of the other five tabs is not visible in the design.
        { label: "Planning machinery or expansion" },
        { label: "Setting up a new unit" },
        { label: "Unit already running" },
        { label: "Approval file stuck" },
        { label: "Subsidy claim stuck" },
      ],
    }),
    sec(
      "case_cards",
      "client-success",
      "Client success",
      {
        eyebrow: "CLIENT SUCCESS",
        heading: "The work. The follow-through. The result.",
        intro: "A closer look at the projects and the work Rapid brings together.",
        items: [
          {
            panel_label: "CLIENT SUCCESS",
            amount: "",
            caption: "Project value approved",
            title: "From farmland to factory: the CLU route in sequence",
            rows: [
              { label: "Service", value: "Land check & Change of Land Use", href: "" },
              { label: "Industry", value: "Manufacturing", href: "" },
              { label: "Location", value: "Haryana", href: "" },
            ],
            cta_label: "See how Rapid helped",
          },
          {
            panel_label: "CLIENT SUCCESS",
            amount: "",
            caption: "Subsidy received",
            date_label: "Date received",
            date_value: "15 Sep 2026",
            title: "Testing-equipment subsidy support in Sirsa",
            rows: [
              { label: "Scheme", value: "Testing Equipment Assistance", href: "/schemes/testing-machine-subsidy" },
              { label: "Industry", value: "Food & agro processing", href: "" },
              { label: "Location", value: "Sirsa district, Haryana", href: "" },
            ],
            cta_label: "See how Rapid helped",
          },
          {
            panel_label: "CLIENT SUCCESS",
            amount: "",
            caption: "Subsidy received",
            date_label: "Date received",
            date_value: "15 Sep 2026",
            title: "Safety-equipment subsidy support in Hisar",
            rows: [
              {
                label: "Scheme",
                value: "Fire Equipment and Safety Compliance Assistance",
                href: "/schemes/fire-equipment-subsidy",
              },
              { label: "Industry", value: "Food & agro processing", href: "" },
              { label: "Location", value: "Hisar district, Haryana", href: "" },
            ],
            cta_label: "See how Rapid helped",
          },
        ],
        cta_label: "View all case studies",
        cta_href: "/case-studies",
      },
      "carousel",
    ),
    reviews({
      eyebrow: "CLIENT EXPERIENCES",
      heading: "In our clients' words.",
      intro: "What it feels like to have Rapid on your side.",
    }),
    logos(8),
    sec("banner", "approach", "The Rapid approach", {
      eyebrow: "THE RAPID APPROACH",
      heading: "Expert guidance. Ownership through execution.",
      subheading: "Your plans. A coordinated path to the next milestone.",
      text: "Rapid brings your documentation, applications and follow-ups together, with clear progress and ownership at every step.",
      primary_label: "Learn more about us",
      primary_href: "/about",
      secondary_label: DISCUSS,
      secondary_href: "",
      tone: "navy",
    }),
    sec("feature_cards", "industries", "Industries we serve", {
      eyebrow: "INDUSTRIES WE SERVE",
      heading: "Built around your business.",
      items: [
        {
          tag: "FOOD & AGRO",
          title: "Food & Agro Processing",
          text: "Support for your next processing unit, mill expansion or equipment investment.",
          cta_label: "Explore industry",
        },
        { tag: "MANUFACTURING", title: "Engineering & Materials Manufacturing", cta_label: "Show details" },
        { tag: "RECYCLING & BIOFUEL", title: "Recycling & Biofuel", cta_label: "Show details" },
        { tag: "COMMERCIAL & LOGISTICS", title: "Commercial & Logistics Facilities", cta_label: "Show details" },
      ],
      cta_label: "View all industries",
      cta_href: "/industries",
    }),
    sec("feature_cards", "insights", "Insights and resources", {
      eyebrow: "INSIGHTS & RESOURCES",
      heading: "Useful answers for your next decision.",
      intro: "Practical reading and resources for business owners and their project teams.",
      filters: texts("Articles", "Guides", "Reports"),
      items: [
        {
          tag: "SITE & APPROVALS",
          title: "Understand Change of Land Use in Haryana",
          text: "How your intended land use and site shape the approval discussion.",
          meta: "Practical guidance",
          cta_label: "Read article",
        },
        {
          tag: "BUSINESS FINANCE",
          title: "Documents required for a business loan",
          text: "Organise the business, financial and project records lenders need.",
          meta: "Practical guidance",
          cta_label: "Read article",
        },
        {
          tag: "REGISTRATIONS",
          title: "Before Udyam registration: check the facts",
          text: "Prepare the business information you will declare before filing.",
          meta: "Practical guidance",
          cta_label: "Read article",
        },
      ],
      cta_label: "View all articles",
      cta_href: "/articles",
    }),
    sec("faq_accordion", "faqs", "Common questions", {
      eyebrow: "COMMON QUESTIONS",
      heading: "Before we begin.",
      intro: "A few useful answers before your first conversation with Rapid.",
      items: [
        {
          question: "Which subsidies could apply to my business?",
          answer_html:
            "<p>The relevant schemes depend on your business activity, location, investment and project dates. Rapid reviews those details, identifies suitable opportunities and takes ownership of the agreed application work.</p>",
        },
        { question: "Can Rapid help with both subsidies and approvals?", answer_html: "" },
        { question: "When should I speak to Rapid about a new unit or expansion?", answer_html: "" },
        { question: "Do I need to know the scheme or approval name?", answer_html: "" },
        { question: "Can my CA, banker or project team join the discussion?", answer_html: "" },
        { question: "What happens after I request a callback?", answer_html: "" },
      ],
      cta_label: "View all FAQs",
      cta_href: "/faqs",
    }),
  ],
});

export const buildPages = () => [
  aboutPage(),
  contactPage(),
  resourcesPage(),
  schemesPage(),
  caseArchivePage(),
  howWeWorkPage(),
  homePage(),
];

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

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  const now = new Date();
  const done = { created: 0, replaced: 0, proposed: 0, skipped: 0 };
  const prepared = buildPages().map(prepare);

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) => sequelize.query(sql, { replacements, transaction, type: "SELECT" });
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
        await revision(existing.id, 2, "publish", NOTE_REPLACED, page);
        done.replaced++;
        continue;
      }

      // Edited by someone: leave it alone, add the seeded text to the history.
      await revision(existing.id, existing.version, "save", NOTE_PROPOSED, page);
      done.proposed++;
    }
  });

  console.log(
    `✅ Managed pages: ${done.created} created, ${done.replaced} replaced, ` +
      `${done.proposed} added to revision history (page was edited), ${done.skipped} already done`,
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
  });
  console.log("⚠️  Rolled back: managed pages (pages edited since were left as they are)");
}
