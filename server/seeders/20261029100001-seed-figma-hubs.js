// seeders/20261029100001-seed-figma-hubs.js
// Round 3 (29 October 2026): the Figma "Your Project" hub, built with the page
// builder's new `stage_section` block and the `hero` masthead variant.
//
//   your-project   published hub (English). Hero with the "Choose where your
//                  project is" card, then the five stages (Buying land, Setting
//                  up, Running, Expanding, File stuck), FAQs and a closing
//                  enquiry form. The sticky menu reads "Choose your project
//                  status:" and links to the stages.
//
//   approvals      published hub (English) at /approvals. It used to be held back
//                  because the old address (/services/statutory-approvals-
//                  consultant) belongs to the website's service route; the hub now
//                  lives at its own path, "approvals", and the navigation points
//                  there (see seeder 20261029100002). Set APPROVALS_HUB_PATH to
//                  seed it at another free path. Seeder 20261029100002 gives it the
//                  closing enquiry panel.
//
// Copy: the stage and step texts that came with the Figma design are used word
// for word. Everything else (Expanding, File stuck, Approvals "Build" and "For
// developers", the FAQ intros and the closing form text) is neutral wording
// draft copy: no outcome, timing or fee promises. It needs Rapid's
// approval before it is relied on. Service cards link only to service pages
// that exist (slugs from seeders/data/rapid-services.json); a card for a
// service with no page of its own has no link.
//
// The "95%" seal and the footnote beside it come from the design; the
// footnote itself says the definition, period and file count are awaiting
// confirmation. Rapid must confirm before the page is promoted.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100001-seed-figma-hubs
//
// Run migrations and seeder 20261024100001-seed-site-pages first. Safe to run
// again, and it never overwrites an editor's work:
//   - a page that is still exactly as first seeded (version 1, one revision) is
//     replaced and published as version 2;
//   - a page that has been edited is left alone; the new layout is added to its
//     revision history ("Figma layout ...") so an editor can open the
//     revisions drawer and restore it;
//   - a page already handled by this seeder is skipped.
// After running, save or publish a page in the dashboard (or wait for the
// website's revalidate interval) to refresh the website cache.

import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { makeSection, normaliseSections } from "../app/helpers/site-page-registry.js";

// The Approvals hub path ("approvals" unless APPROVALS_HUB_PATH names another free path).
const APPROVALS_HUB_PATH = process.env.APPROVALS_HUB_PATH || "approvals";

const services = JSON.parse(
  fs.readFileSync(new URL("./data/rapid-services.json", import.meta.url), "utf8"),
);

// Revision notes double as markers, so a second run recognises its own work.
const NOTE_REPLACED = "Figma hub layout (seeded, replaces the first seeded sections)";
const NOTE_PROPOSED = "Figma hub layout (seeded). Restore this revision to use it";

// ── Service links (only pages that exist) ─────────────────────────────────

const SERVICE_SLUG = Object.fromEntries(
  services.filter((service) => service.is_active).map((service) => [service.code, service.slug]),
);
export const link = (code) => {
  const slug = SERVICE_SLUG[code];
  if (!slug) throw new Error(`Seed: service ${code} not found in rapid-services.json`);
  return `/services/${slug}`;
};

export const PAGE = {
  clu: link("D060"),
  roadAccess: link("D061"),
  fire: link("D062"),
  forest: link("D063"),
  buildingPlan: link("D065"),
  cte: link("D066"),
  cto: link("D067"),
  warehousing: link("D068"),
  hazardous: link("D069"),
  industrialColony: link("D070"),
  deenDayal: link("D071"),
  commercialColony: link("D072"),
  occupation: link("D073"),
  insurance: link("D083"),
  insuranceClaims: link("D084"),
  equipmentLoan: link("D090"),
  subsidies: link("S01"),
  approvals: link("S02"),
  finance: link("S05"),
};

// FAQ items of a service's English page, word for word.
export const serviceFaq = (code) => {
  const english = services
    .find((service) => service.code === code)
    ?.translations.find((translation) => translation.locale === "en");
  const section = english?.sections.find((entry) => entry.role === "faq");
  return (section?.items ?? []).map((item) => ({
    question: item.title,
    answer_html: String(item.html).replace(/^<p>\s+/, "<p>"),
  }));
};

// Home page FAQ, word for word (same text as seeder 20261024100001).
export const FAQ_CALLBACK = {
  question: "What happens when I request a callback?",
  answer_html:
    "<p>Share your name and mobile number. An expert consultant from Rapid will call you back to understand the project and explain how Rapid can take the work forward, including the scope, fee and next steps. You do not need to know the scheme or approval name.</p>",
};
export const FAQ_READY = {
  question: "What should I have ready before the conversation?",
  answer_html:
    "<p>Nothing formal is needed. It helps to know what you are building, expanding or buying, where, the approximate investment, your timeline and what you have already committed. Rapid will tell you which records are needed for the work you decide to take forward.</p>",
};
export const FAQ_GUARANTEE = {
  question: "Does Rapid guarantee a subsidy, approval or loan?",
  answer_html:
    "<p>No. Subsidies, approvals and finance decisions rest with the relevant authority or lender. Rapid prepares and coordinates the agreed application and documentation work and follows it through to the agreed milestone, keeping you informed of progress and the next action.</p>",
};

// ── Builders ──────────────────────────────────────────────────────────────

export const card = (title, hint, href = "") => ({ title, hint, href });
export const mistake = (text) => ({ text, link_label: "", link_href: "" });
export const needs = (text, link_label, link_href = "") => ({ text, link_label, link_href });

// One stage / step of the journey.
export const stage = ({
  anchor,
  label,
  eyebrow,
  title,
  body,
  tone = "light",
  kind,
  sideTitle,
  sideItems,
  cards,
  cta,
  preset,
  secondary,
}) =>
  makeSection("stage_section", {
    label,
    anchor,
    data: {
      eyebrow,
      title,
      body,
      tone,
      side_kind: kind,
      side_title: sideTitle,
      side_items: sideItems,
      services_label: "Services we provide",
      services: cards,
      primary_cta_label: cta,
      primary_cta_action: "enquiry",
      primary_cta_preset: preset,
      primary_cta_href: "",
      secondary_cta_label: secondary ?? "",
      secondary_cta_href: "",
    },
  });

// The "File stuck" section is the same on both hubs (draft copy).
export const fileStuck = (eyebrow, preset) =>
  stage({
    anchor: "file-stuck",
    label: "File stuck",
    eyebrow,
    title: "File stuck? Find out what is holding it.",
    body: "Applications, subsidy claims and approvals can wait for many reasons: a query that was not answered, a document that was not accepted, a step that was missed. Before you decide who to pay to chase it, find out where the file is and what it is waiting for. Send us the application number, the department or lender, and any letter or query you received.",
    kind: "mistakes",
    sideTitle: "Common mistakes",
    sideItems: [
      mistake("Paying a fee to chase a file before knowing why it is stuck."),
      mistake("Sending the same documents again without reading the query that was raised."),
      mistake("Waiting for a reminder, then finding that the time to claim or reply has passed."),
    ],
    cards: [
      card("Subsidy claims", "Claim pending? Check what the department is waiting for.", PAGE.subsidies),
      card("Approval applications", "Application queried? Find out what is missing.", PAGE.approvals),
      card("Insurance claims", "Claim delayed? Get help with the next step.", PAGE.insuranceClaims),
      card("Finance files", "Loan file pending? See what the lender needs.", PAGE.finance),
    ],
    cta: "Check my file",
    preset,
  });

export const hero = ({ eyebrow, heading, intro, highlights, footnote, cardTitle, rows, navLabel }) =>
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
      card_items: rows.map(([title, text, target]) => ({ title, text, target })),
      nav_label: navLabel,
    },
  });

// ── Your Project hub ──────────────────────────────────────────────────────

const YOUR_PROJECT = {
  page_key: "pg_hubyourprj",
  template: "hub",
  locale: "en",
  path: "your-project",
  title: "Your project",
  h1: "Different consultants, different approvals, and nobody owns the whole project.",
  meta_title: "Your project | Rapid Consulting",
  meta_description:
    "Start with where your project is: buying land, setting up, running, expanding or a file that is stuck. Rapid helps with the land, approvals, subsidies, project reports and insurance for each stage.",
  sections: [
    hero({
      eyebrow: "Your project",
      heading: "Different consultants, different approvals, and nobody owns the whole project.",
      intro:
        "From buying land to expanding in Haryana, start with where your project is. You don't need to know the approval name by name.",
      highlights: [
        ["One team at every stage.", "Land, approvals, subsidies, project reports and insurance."],
        ["A named person on your project.", "From the first call to the last approval."],
        ["Your first check is free.", "It shows what applies to your project, and what doesn't."],
      ],
      footnote: "*Across all services. Success definition, period and file count awaiting confirmation.",
      cardTitle: "Choose where your project is",
      rows: [
        ["Buying land", "Found a plot, or still comparing sites", "buying-land"],
        ["Setting up", "Building, getting approvals, arranging the loan", "setting-up"],
        ["Running", "In production, with renewals and claims to keep up", "running"],
        ["Expanding", "Adding machinery or capacity", "expanding"],
        ["File stuck", "Find out what is holding it up before you decide the next step", "file-stuck"],
      ],
      navLabel: "Choose your project status:",
    }),

    stage({
      anchor: "buying-land",
      label: "Buying land",
      eyebrow: "Stage 1 · Buying land",
      title: "Buying land? Make sure the plot can take your factory.",
      body: "Once the registry is done, you can't change the plot. If the zone doesn't allow your unit, the road is too narrow or the records aren't clean, your money is already in the land. A check before the token tells you while you can still walk away.",
      kind: "mistakes",
      sideTitle: "Common mistakes",
      sideItems: [
        mistake("Paying the token on the broker's word that CLU will happen."),
        mistake("Checking the title, but not the zone or the road."),
        mistake("Taking the factory next door as proof your plot will get approval."),
      ],
      cards: [
        card("48-hour Land Check", "Found a plot? Check zone, road and cost first."),
        card("Pre-purchase due diligence", "Ready to register? Get zone, road and title checked in one report."),
        card("Change of Land Use (CLU)", "Farmland? Get it approved for your unit.", PAGE.clu),
        card("Road access NOC", "On a highway or state road? Get entry approved.", PAGE.roadAccess),
      ],
      cta: "Check my plot",
      preset: "buying-land",
    }),

    stage({
      anchor: "setting-up",
      label: "Setting up",
      eyebrow: "Stage 2 · Setting up",
      title: "Setting up? Get your approvals in the right order.",
      body: "Approvals depend on each other. The building plan needs the CLU, and production usually needs a consent to operate and a fire NOC. Miss one and the project waits while your loan interest runs.",
      kind: "mistakes",
      sideTitle: "Common mistakes",
      sideItems: [
        mistake("Getting drawings made before the CLU conditions are known."),
        mistake("Starting construction on an application receipt."),
        mistake("A project report that shows the subsidy wrongly, so the bank or the scheme turns it down."),
      ],
      cards: [
        card("Approval roadmap", "Starting a new unit? See each approval, and when."),
        card("Building plan approval", "Ready to build? Get your drawings sanctioned.", PAGE.buildingPlan),
        card("Consent to Establish (CTE)", "Before construction? Get your pollution consent.", PAGE.cte),
        card("Consent to Operate (CTO)", "Before production? Get permission to operate.", PAGE.cto),
        card("Fire NOC", "Building? Get the fire clearance.", PAGE.fire),
      ],
      cta: "Get my approval roadmap",
      preset: "setting-up",
      secondary: "Explore factory setup support",
    }),

    stage({
      anchor: "running",
      label: "Running",
      eyebrow: "Stage 3 · Running",
      title: "Running? Keep what you have, and claim what you're owed.",
      body: "Consents, fire NOC and licences each have renewal windows. Miss a renewal and you may pay a penalty or apply again. Miss a claim window and the benefit can be lost.",
      tone: "navy",
      kind: "mistakes",
      sideTitle: "Common mistakes",
      sideItems: [
        mistake("Assuming a subsidy comes automatically. Most need a claim filed, some every year."),
        mistake("Keeping renewal dates in several places, so one of them is missed."),
        mistake("Leaving the insurance as it was after the plant, machinery or stock has changed."),
      ],
      cards: [
        card("CTO renewal", "Consent expiring? Renew it on time.", PAGE.cto),
        card("Fire NOC renewal", "Fire NOC due? Renew before it lapses.", PAGE.fire),
        card("Factory licence renewal", "Licence year ending? Renew without a gap."),
        card("Industrial insurance", "Plant insured? The right cover, every year.", PAGE.insurance),
        card("Insurance claims", "Had a loss? Get help with the claim.", PAGE.insuranceClaims),
      ],
      cta: "Check what's due",
      preset: "running",
      secondary: "Explore running-unit support",
    }),

    // draft copy, needs Rapid approval.
    stage({
      anchor: "expanding",
      label: "Expanding",
      eyebrow: "Stage 4 · Expanding",
      title: "Expanding? Check the approvals and incentives before you order machinery.",
      body: "Adding machinery or capacity can change what your unit needs: a consent amendment, a fresh look at fire and pollution conditions, and the dates and conditions a subsidy depends on. Checking before you order and install keeps your options open, and gives the project report and any loan top-up the right figures.",
      kind: "mistakes",
      sideTitle: "Common mistakes",
      sideItems: [
        mistake("Ordering machinery before checking whether a scheme's conditions or dates are affected."),
        mistake("Assuming the existing consents already cover the new capacity or process."),
        mistake("Updating the project report late, so the bank or the scheme works from old figures."),
      ],
      cards: [
        card("Subsidy advisory", "Planning machinery? See which schemes may apply.", PAGE.subsidies),
        card("Consent to Establish (CTE)", "Adding capacity? Check whether your consent needs changing.", PAGE.cte),
        card("Consent to Operate (CTO)", "New process? Check your operating consent.", PAGE.cto),
        card("Equipment loan", "Funding machinery? Prepare the loan file.", PAGE.equipmentLoan),
        card("Industrial insurance", "New machinery? Review the cover.", PAGE.insurance),
      ],
      cta: "Plan my expansion",
      preset: "expanding",
      secondary: "Explore expansion support",
    }),

    // draft copy, needs Rapid approval.
    fileStuck("Stage 5 · File stuck", "file-stuck"),

    makeSection("faq", {
      label: "FAQs",
      anchor: "faqs",
      data: {
        heading: "Before we begin.",
        items: [FAQ_CALLBACK, FAQ_READY, FAQ_GUARANTEE],
      },
    }),

    // draft copy, needs Rapid approval.
    makeSection("enquiry_form", {
      anchor: "enquiry-form",
      data: {
        heading: "Tell us where your project is.",
        intro:
          "Share a few details and an expert consultant from Rapid will call you back to understand the project. The first check is on us.",
        preset_kind: "enquiry",
        preset_stage: "",
      },
    }),
  ],
};

// ── Approvals hub (seeded only when APPROVALS_HUB_PATH is set) ────────────

export const approvalsPage = (path) => ({
  page_key: "pg_hubapprovals",
  template: "hub",
  locale: "en",
  path,
  title: "Approvals",
  h1: "A finished factory can still wait on one missing approval.",
  meta_title: "Approvals for factories in Haryana | Rapid Consulting",
  meta_description:
    "Approvals for factories in Haryana, from CLU to consent to operate, in the right order: land and site, build, start and run, and approvals for developers.",
  sections: [
    hero({
      eyebrow: "Approvals",
      heading: "A finished factory can still wait on one missing approval.",
      intro: "Approvals for factories in Haryana, from CLU to consent to operate, in the right order.",
      highlights: [
        ["A written plan, with dates.", "You'll know what's next, and when it's due."],
        ["Renewals tracked.", "We keep your renewal dates so nothing lapses."],
        ["Your first check is free.", "It shows which approvals apply to your unit, and which don't."],
      ],
      footnote: "*Across all services. Success definition, period and file count awaiting confirmation.",
      cardTitle: "Approvals, step by step",
      rows: [
        ["Land and site", "CLU, road access and forest clearance", "land-and-site"],
        ["Build", "Building plan, pollution consent and fire", "build"],
        ["Start and run", "Operating consent, licences and renewals", "start-and-run"],
        ["For developers", "Colony licences, warehousing and RERA", "for-developers"],
      ],
      navLabel: "Find your approvals:",
    }),

    stage({
      anchor: "land-and-site",
      label: "Land and site",
      eyebrow: "Step 1 · Land and site",
      title: "Is the plot allowed for your unit?",
      body: "Everything after this depends on the land. The building plan needs the CLU, and the road decides whether your unit gets access at all. Settle the land first and the rest can follow.",
      kind: "needs",
      sideTitle: "You'll need these if",
      sideItems: [
        needs("The plot is farmland", "Change of Land Use (CLU)", PAGE.clu),
        needs("It fronts a state or national highway", "Road access NOC", PAGE.roadAccess),
        needs("It's near a forest or notified area", "Forest NOC", PAGE.forest),
        needs("You haven't bought it yet", "48-hour Land Check"),
      ],
      cards: [
        card("48-hour Land Check", "Found a plot? Check zone, road and cost first."),
        card("Change of Land Use (CLU)", "Farmland? Get it approved for your unit.", PAGE.clu),
        card("Zoning check and DTP NOC", "Not sure what's allowed? Check the zone before you plan."),
        card("Road access NOC", "On a highway or state road? Get entry approved.", PAGE.roadAccess),
        card("Forest NOC", "Near a forest? Get the clearance first.", PAGE.forest),
      ],
      cta: "Check my plot",
      preset: "approvals-land-and-site",
    }),

    // draft copy, needs Rapid approval.
    stage({
      anchor: "build",
      label: "Build",
      eyebrow: "Step 2 · Build",
      title: "Building? Apply in the order the approvals need.",
      body: "The building plan, the consent to establish and the fire NOC each have their own conditions, and they often depend on one another. Applying in the right order, with the right documents, avoids redoing work while construction waits.",
      kind: "needs",
      sideTitle: "You'll need these if",
      sideItems: [
        needs("You are ready to build", "Building plan approval", PAGE.buildingPlan),
        needs("Your unit has a pollution category", "Consent to Establish (CTE)", PAGE.cte),
        needs("Your building falls under fire safety rules", "Fire NOC", PAGE.fire),
        needs("You want each approval and its date on one page", "Approval roadmap"),
      ],
      cards: [
        card("Approval roadmap", "Starting a new unit? See each approval, and when."),
        card("Building plan approval", "Ready to build? Get your drawings sanctioned.", PAGE.buildingPlan),
        card("Consent to Establish (CTE)", "Before construction? Get your pollution consent.", PAGE.cte),
        card("Fire NOC", "Building? Get the fire clearance.", PAGE.fire),
      ],
      cta: "Get my approval plan",
      preset: "approvals-build",
    }),

    stage({
      anchor: "start-and-run",
      label: "Start and run",
      eyebrow: "Step 3 · Start and run",
      title: "Open on time, and stay open.",
      body: "Production needs a consent to operate, and usually an occupation certificate and a factory licence. Once you're running, the consent, the fire NOC and the licence each have renewal dates. Miss one and you may pay a penalty or apply again.",
      tone: "navy",
      kind: "needs",
      sideTitle: "You'll need these if",
      sideItems: [
        needs("Your unit has a pollution category", "Consent to Operate (CTO)", PAGE.cto),
        needs("The building is complete", "Occupation certificate", PAGE.occupation),
        needs("You employ workers above the legal limit", "Factory licence"),
        needs("Your process creates hazardous waste", "Hazardous waste authorisation", PAGE.hazardous),
      ],
      cards: [
        card("Consent to Operate (CTO)", "Ready to produce? Get your operating consent.", PAGE.cto),
        card("Occupation certificate", "Building complete? Get the completion certificate.", PAGE.occupation),
        card("Factory licence", "Employing workers? Get your factory licence."),
        card("Hazardous waste authorisation", "Hazardous waste from your process? Get it authorised.", PAGE.hazardous),
        card("CTO renewal", "Consent expiring? Renew it on time.", PAGE.cto),
      ],
      cta: "Check what's due",
      preset: "approvals-start-and-run",
    }),

    // draft copy, needs Rapid approval.
    stage({
      anchor: "for-developers",
      label: "For developers",
      eyebrow: "Step 4 · For developers",
      title: "Developing a colony or a warehouse? Start with the licence.",
      body: "Colony licences, warehousing approvals and RERA registration each have their own conditions and sequence. Knowing which apply to your project before you buy land or sell units keeps the approvals and the plan in step.",
      kind: "needs",
      sideTitle: "You'll need these if",
      sideItems: [
        needs("You are developing an industrial plotted colony", "Industrial colony licence", PAGE.industrialColony),
        needs("You are developing a commercial plotted colony", "Commercial colony licence", PAGE.commercialColony),
        needs("You are developing a residential colony under the Deen Dayal Jan Awas Yojana", "Residential colony licence", PAGE.deenDayal),
        needs("You are developing a warehouse", "Warehousing registration and approval", PAGE.warehousing),
      ],
      cards: [
        card("Industrial colony licence", "Plotted industrial colony? Check the licence route.", PAGE.industrialColony),
        card("Commercial colony licence", "Plotted commercial colony? Check the licence route.", PAGE.commercialColony),
        card("Residential colony licence", "Deen Dayal Jan Awas Yojana colony? Check the licence.", PAGE.deenDayal),
        card("Warehousing approval", "Building a warehouse? Check registration and approval.", PAGE.warehousing),
        card("RERA registration", "Selling plots or units? Check whether RERA applies."),
      ],
      cta: "Discuss my development",
      preset: "approvals-developers",
    }),

    // draft copy, needs Rapid approval.
    fileStuck("File stuck", "approvals-file-stuck"),

    makeSection("faq", {
      label: "FAQs",
      anchor: "faqs",
      data: {
        heading: "Questions about approvals.",
        items: [...serviceFaq("S02"), FAQ_GUARANTEE],
      },
    }),

    // draft copy, needs Rapid approval.
    makeSection("enquiry_form", {
      anchor: "enquiry-form",
      data: {
        heading: "Tell us about your plot or your unit.",
        intro:
          "Share a few details and an expert consultant from Rapid will call you back to see which approvals may apply. The first check is on us.",
        preset_kind: "enquiry",
        preset_stage: "",
      },
    }),
  ],
});

const PAGES = [YOUR_PROJECT];
if (APPROVALS_HUB_PATH) PAGES.push(approvalsPage(APPROVALS_HUB_PATH));

// ── Helpers ───────────────────────────────────────────────────────────────

// Checks every page (the Approvals hub too, even when it is not seeded, so a
// mistake in its content shows up now rather than the day it is switched on).
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
  const done = { created: 0, replaced: 0, proposed: 0, skipped: 0 };

  const prepared = PAGES.map(prepare);
  if (!APPROVALS_HUB_PATH) prepare(approvalsPage("approvals-check"));

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

    for (const page of prepared) {
      const [existing] = await select(
        "SELECT id, version, status FROM site_pages WHERE (locale = :locale AND path = :path) OR page_key = :page_key",
        { locale: page.locale, path: page.path, page_key: page.page_key },
      );

      // New page: insert it, published.
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
        await revision(id, 1, "publish", "Initial content (seeded, Figma hub layout)", page);
        done.created++;
        continue;
      }

      const revisions = await select(
        "SELECT note FROM site_page_revisions WHERE site_page_id = :id",
        { id: existing.id },
      );
      if (revisions.some((entry) => entry.note === NOTE_REPLACED || entry.note === NOTE_PROPOSED)) {
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

      // Edited (or unpublished) by someone: leave it alone, add the new layout
      // to the history so it can be restored from the revisions drawer.
      await revision(existing.id, existing.version, "save", NOTE_PROPOSED, page);
      done.proposed++;
    }
  });

  console.log(
    `✅ Figma hubs: ${done.created} created, ${done.replaced} replaced, ${done.proposed} added to revision history (page was edited), ${done.skipped} already done` +
      (APPROVALS_HUB_PATH ? "" : ". Approvals hub not seeded (no free path, see the notes in this seeder)."),
  );
}

export async function down({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "SELECT" });

    for (const page of PAGES) {
      const [row] = await select("SELECT id, version FROM site_pages WHERE locale = :locale AND path = :path", {
        locale: page.locale,
        path: page.path,
      });
      if (!row) continue;

      const [replaced] = await select(
        "SELECT id, version FROM site_page_revisions WHERE site_page_id = :id AND note = :note",
        { id: row.id, note: NOTE_REPLACED },
      );
      const [proposed] = await select(
        "SELECT id FROM site_page_revisions WHERE site_page_id = :id AND note = :note",
        { id: row.id, note: NOTE_PROPOSED },
      );

      if (proposed) {
        await sequelize.query("DELETE FROM site_page_revisions WHERE id = :id", {
          replacements: { id: proposed.id },
          transaction,
        });
      }

      // Put the first seeded sections back, but only if nobody edited the page since.
      if (replaced && row.version === replaced.version) {
        const [first] = await select(
          "SELECT snapshot FROM site_page_revisions WHERE site_page_id = :id AND version = 1 ORDER BY created_at ASC LIMIT 1",
          { id: row.id },
        );
        const old = first?.snapshot;
        if (old && Array.isArray(old.sections)) {
          await sequelize.query(
            `UPDATE site_pages SET
               title = :title, h1 = :h1, meta_title = :meta_title, meta_description = :meta_description,
               sections = CAST(:sections AS jsonb), published_sections = CAST(:sections AS jsonb),
               published_meta = CAST(:meta AS jsonb), version = 1, updated_at = :now
             WHERE id = :id`,
            {
              replacements: {
                id: row.id,
                title: old.title ?? "",
                h1: old.h1 ?? "",
                meta_title: old.meta_title ?? "",
                meta_description: old.meta_description ?? "",
                sections: JSON.stringify(old.sections),
                meta: JSON.stringify({
                  title: old.title ?? "",
                  h1: old.h1 ?? "",
                  meta_title: old.meta_title ?? "",
                  meta_description: old.meta_description ?? "",
                }),
                now: new Date(),
              },
              transaction,
            },
          );
          await sequelize.query("DELETE FROM site_page_revisions WHERE id = :id", {
            replacements: { id: replaced.id },
            transaction,
          });
        }
      }
    }
  });
  console.log("⚠️  Rolled back: Figma hub layout (pages edited since were left as they are)");
}
