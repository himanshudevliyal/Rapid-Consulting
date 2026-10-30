// seeders/20261024100001-seed-site-pages.js
// Round 2 (October 2026): the first pages built with the page builder, and the
// default site navigation.
//
//   Published hub pages (English):
//     your-project            stage chooser (buying land ... a file stuck at any stage)
//     finance-and-insurance   cards to the finance, insurance and licence service pages
//     faqs                    FAQ hub with topic tabs
//   Setting "navigation":     the 7 primary destinations, in this order
//
// The copy is neutral and factual and makes no promises about outcomes, fees
// or timing. Where it is not new, it is copied word for word from content the
// website already has (the home page FAQ, the contact page, the service FAQs in
// seeders/data/rapid-services.json). Rapid edits everything afterwards in the
// dashboard (Site pages, Navigation); nothing here is a claim about Rapid.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261024100001-seed-site-pages
//           (removes the three pages if they were never edited, and the
//           navigation setting if it still has the default value)
//
// Run migration 20261024100001 first (it creates site_pages, site_page_revisions
// and site_settings). Safe to run again: a page whose path (or key) already
// exists is skipped, and an existing navigation setting is never overwritten.

import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { defaultNavigation } from "../app/helpers/site-navigation.js";
import { makeSection, normaliseSections } from "../app/helpers/site-page-registry.js";

const services = JSON.parse(
  fs.readFileSync(new URL("./data/rapid-services.json", import.meta.url), "utf8"),
);

// FAQ items of a service's English page, word for word.
const serviceFaq = (code) => {
  const english = services
    .find((service) => service.code === code)
    ?.translations.find((translation) => translation.locale === "en");
  const section = english?.sections.find((entry) => entry.role === "faq");
  return (section?.items ?? []).map((item) => ({
    question: item.title,
    answer_html: String(item.html).replace(/^<p>\s+/, "<p>"),
  }));
};

// Home page FAQ (H01) and contact page (C01) text, word for word.
const HOME = {
  whatRapidDoes: {
    question: "What does Rapid Consulting do?",
    answer_html:
      "<p>Rapid is a Hisar-based advisory firm that works with businesses across Haryana on subsidy and incentive advisory, statutory approvals, licences and certifications, industrial insurance, and finance-related documentation. We agree the scope of each assignment with you before work begins.</p>",
  },
  qualify: {
    question: "How do I know whether my project may qualify for a subsidy or incentive?",
    answer_html:
      "<p>It depends on the project: the activity, the location, the investment, the timing and the conditions of each programme. A scheme listed on this website shows that it is relevant to a type of project, not that your project is eligible. An expert consultant looks at your project details and explains what appears relevant.</p>",
  },
  callback: {
    question: "What happens when I request a callback?",
    answer_html:
      "<p>Share your name and mobile number. An expert consultant from Rapid will call you back to understand the project and explain how Rapid can take the work forward, including the scope, fee and next steps. You do not need to know the scheme or approval name.</p>",
  },
  ready: {
    question: "What should I have ready before the conversation?",
    answer_html:
      "<p>Nothing formal is needed. It helps to know what you are building, expanding or buying, where, the approximate investment, your timeline and what you have already committed. Rapid will tell you which records are needed for the work you decide to take forward.</p>",
  },
  guarantee: {
    question: "Does Rapid guarantee a subsidy, approval or loan?",
    answer_html:
      "<p>No. Subsidies, approvals and finance decisions rest with the relevant authority or lender. Rapid prepares and coordinates the agreed application and documentation work and follows it through to the agreed milestone, keeping you informed of progress and the next action.</p>",
  },
  schemes: {
    question: "Where can I read about named schemes and their conditions?",
    answer_html:
      '<p>Each scheme has its own page with its key facts, conditions and official sources in the <a href="/en/schemes">scheme directory</a>. Policy details change, so check the scheme page and the official source for the current position before you rely on it.</p>',
  },
};
const CONTACT_AFTER_FIRST_DISCUSSION = {
  question: "What happens after the first discussion?",
  answer_html:
    "<p>We identify the relevant requirement and the information needed for the next step. Where an assessment or advisory assignment is appropriate, we explain the proposed scope, responsibilities and fee basis before the agreed work proceeds.</p>",
};

// ── The three hubs ────────────────────────────────────────────────────────

const PAGES = [
  {
    page_key: "pg_hubyourprj",
    template: "hub",
    locale: "en",
    path: "your-project",
    title: "Your project",
    h1: "Where is your project right now?",
    meta_title: "Your project | Rapid Consulting",
    meta_description:
      "Choose the stage your project is at and talk to Rapid about the next step: buying land, setting up, running, expanding, or a file stuck at any stage.",
    sections: [
      makeSection("masthead", {
        data: {
          eyebrow: "Your project",
          heading: "Where is your project right now?",
          intro_html:
            "<p>Choose the stage closest to where you are today and talk to Rapid about the next step. You do not need to know the scheme or approval name to start.</p>",
          primary_cta_label: "Discuss your project",
          show_whatsapp: true,
        },
      }),
      makeSection("stage_chooser", {
        label: "Stages",
        data: {
          heading: "Choose your stage",
          intro: "Select the stage that fits, then talk to Rapid about it.",
          stages: [
            {
              key: "buying-land",
              title: "Buying land",
              text: "Checking the land, its permitted use and the approvals the plot may need before you commit.",
              primary_label: "Discuss this stage",
              page_href: "",
            },
            {
              key: "setting-up",
              title: "Setting up",
              text: "Planning the unit, its approvals, licences and funding before and during construction.",
              primary_label: "Discuss this stage",
              page_href: "",
            },
            {
              key: "running",
              title: "Running",
              text: "Keeping licences, consents and renewals in order while the unit operates.",
              primary_label: "Discuss this stage",
              page_href: "",
            },
            {
              key: "expanding",
              title: "Expanding",
              text: "Adding capacity or a new activity, and checking the approvals, incentives and finance that apply.",
              primary_label: "Discuss this stage",
              page_href: "",
            },
            {
              key: "file-stuck",
              title: "A file stuck at any stage",
              text: "An application is pending, queried or delayed and you want to understand the next step.",
              primary_label: "Discuss this stage",
              page_href: "",
            },
          ],
        },
      }),
      makeSection("faq", {
        label: "Questions",
        data: {
          heading: "Common questions",
          items: [HOME.callback, HOME.ready, HOME.guarantee],
        },
      }),
      makeSection("cta_panel", {
        data: {
          heading: "Not sure which stage fits?",
          text: "Share a short description of your project. An expert consultant from Rapid will call you to understand it.",
          button_label: "Request a callback",
          preset_kind: "enquiry",
        },
      }),
    ],
  },
  {
    page_key: "pg_hubfinance",
    template: "hub",
    locale: "en",
    path: "finance-and-insurance",
    title: "Finance and insurance",
    h1: "Finance and insurance",
    meta_title: "Finance and insurance | Rapid Consulting",
    meta_description:
      "Industrial insurance and claims, project and working-capital finance, and business licences and certifications. Choose the area that matches your question.",
    sections: [
      makeSection("masthead", {
        data: {
          eyebrow: "Services",
          heading: "Finance and insurance",
          intro_html:
            "<p>Support with industrial insurance documentation and claims, and with project, equipment and working-capital finance. Choose the area closest to your question.</p>",
          primary_cta_label: "Discuss your requirement",
          show_whatsapp: true,
        },
      }),
      makeSection("card_grid", {
        label: "Areas of support",
        data: {
          heading: "Choose an area",
          intro: "",
          columns: "3",
          items: [
            {
              title: "Industrial Insurance",
              text: "Explore industrial insurance documentation and claim coordination. Rapid helps organise business records, provider questions and next actions.",
              href: "/services/industrial-insurance-consultant",
              link_label: "Industrial insurance",
            },
            {
              title: "Finance & Other Services",
              text: "Prepare project, equipment and working-capital finance or review existing borrowing. Rapid coordinates business evidence and lender applications.",
              href: "/services/finance-and-other-services",
              link_label: "Finance and other services",
            },
            {
              title: "Licences & Certifications",
              text: "Explore FSSAI, IEC, LEI, startup, Udyam, ISO and ZED requirements. Rapid helps identify and coordinate the right business-document route.",
              href: "/services/trade-license-consultant",
              link_label: "Licences and certifications",
            },
          ],
        },
      }),
      makeSection("cta_panel", {
        data: {
          heading: "Talk to Rapid about your requirement",
          text: "Share a short description and an expert consultant from Rapid will call you back to understand it.",
          button_label: "Request a callback",
          preset_kind: "enquiry",
        },
      }),
    ],
  },
  {
    page_key: "pg_hubfaqs001",
    template: "hub",
    locale: "en",
    path: "faqs",
    title: "Frequently asked questions",
    h1: "Frequently asked questions",
    meta_title: "Frequently asked questions | Rapid Consulting",
    meta_description:
      "Answers to common questions about subsidies, approvals, land and CLU, and working with Rapid.",
    sections: [
      makeSection("masthead", {
        data: {
          eyebrow: "Questions",
          heading: "Frequently asked questions",
          intro_html:
            "<p>Answers to common questions about subsidies, approvals, land and CLU, and working with Rapid. Choose a topic.</p>",
          primary_cta_label: "Ask a question",
          show_whatsapp: true,
        },
      }),
      makeSection("faq_hub", {
        label: "Questions",
        data: {
          heading: "",
          topics: [
            {
              key: "subsidies",
              title: "Subsidies",
              items: [HOME.qualify, HOME.schemes, ...serviceFaq("S01")],
            },
            { key: "approvals", title: "Approvals", items: serviceFaq("S02") },
            { key: "land-and-clu", title: "Land and CLU", items: serviceFaq("D060") },
            {
              key: "working-with-rapid",
              title: "Working with Rapid",
              items: [
                HOME.whatRapidDoes,
                HOME.callback,
                HOME.ready,
                HOME.guarantee,
                CONTACT_AFTER_FIRST_DISCUSSION,
              ],
            },
          ],
        },
      }),
      makeSection("cta_panel", {
        data: {
          heading: "Still have a question?",
          text: "Share it with Rapid and an expert consultant will call you back.",
          button_label: "Request a callback",
          preset_kind: "enquiry",
        },
      }),
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

// JSON with sorted keys, so a stored (reordered) JSONB value compares equal.
const stable = (value) =>
  JSON.stringify(value, (key, entry) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : entry,
  );

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  const now = new Date();
  let pagesAdded = 0;
  let navigationAdded = 0;

  // Check every page before writing anything.
  const prepared = PAGES.map((page) => {
    const { sections, errors } = normaliseSections(page.sections, {
      template: page.template,
      strict: true,
    });
    if (errors.length) {
      throw new Error(
        `Seed page "${page.path}" is not valid: ${errors.map((error) => error.message).join("; ")}`,
      );
    }
    return { ...page, sections };
  });

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "SELECT" });

    for (const page of prepared) {
      const [existing] = await select(
        "SELECT id FROM site_pages WHERE (locale = :locale AND path = :path) OR page_key = :page_key",
        { locale: page.locale, path: page.path, page_key: page.page_key },
      );
      if (existing) continue;

      const id = randomUUID();
      const meta = {
        title: page.title,
        h1: page.h1,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
      };
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
            title: page.title,
            h1: page.h1,
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            status: "published",
            translation_status: "missing",
            sections: JSON.stringify(page.sections),
            published_sections: JSON.stringify(page.sections),
            published_meta: JSON.stringify(meta),
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
      await queryInterface.bulkInsert(
        "site_page_revisions",
        [
          {
            id: randomUUID(),
            site_page_id: id,
            version: 1,
            action: "publish",
            note: "Initial content (seeded)",
            snapshot: JSON.stringify({
              template: page.template,
              locale: page.locale,
              path: page.path,
              ...meta,
              translation_status: "missing",
              sections: page.sections,
            }),
            created_by: null,
            created_by_name: "Seeder",
            created_at: now,
          },
        ],
        { transaction },
      );
      pagesAdded++;
    }

    // Default navigation: only when none has been saved.
    const [navigation] = await select("SELECT key FROM site_settings WHERE key = 'navigation'");
    if (!navigation) {
      await queryInterface.bulkInsert(
        "site_settings",
        [
          {
            key: "navigation",
            value: JSON.stringify(defaultNavigation()),
            updated_by: null,
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );
      navigationAdded = 1;
    }
  });

  console.log(`✅ Seeded ${pagesAdded} site pages and ${navigationAdded} navigation setting`);
}

export async function down({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;

  // Pages that were never edited (version 1); their revisions go with them.
  await sequelize.query(
    "DELETE FROM site_pages WHERE page_key IN (:keys) AND version = 1",
    { replacements: { keys: PAGES.map((page) => page.page_key) } },
  );

  const [row] = await sequelize.query("SELECT value FROM site_settings WHERE key = 'navigation'", {
    type: "SELECT",
  });
  if (row && stable(row.value) === stable(defaultNavigation())) {
    await sequelize.query("DELETE FROM site_settings WHERE key = 'navigation'");
  }
  console.log("⚠️  Rolled back: seeded site pages (if unedited) and the default navigation");
}
