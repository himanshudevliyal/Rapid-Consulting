"use strict";
// Site pages: the block registry (single source of truth).
//
// Everything the page builder knows lives here: the templates (which blocks a
// page type may use), the blocks (their variants and editable fields) and the
// rules that check and clean a page's `sections` before it is stored.
//
//   - GET /v1/site-pages/registry and GET /v1/public/site-pages/registry serve
//     getRegistry() as it is, so the dashboard builds its editor forms from it
//     and the website knows which block components exist.
//   - normaliseSections() is used on every save / publish / restore. It drops
//     unknown keys, trims text, sanitises html, makes anchors unique and
//     reports what is wrong, per section and field.
//
// This file is pure (no database, no framework) so seeders can import it too.
// Adding a block type = one entry in BLOCKS (+ the template lists + a web
// component); nothing else on the server changes.

import { randomUUID } from "node:crypto";
import slugify from "slugify";

// ── Constants ─────────────────────────────────────────────────────────────

export const LOCALES = ["en", "hi"];
export const STATUSES = ["draft", "review", "published", "archived"];
export const TRANSLATION_STATUSES = ["not_needed", "missing", "needs_review", "reviewed"];
export const MAX_SECTIONS = 60;
export const LABEL_MAX = 40;

// First URL segment of routes the website already owns. A site page path may
// not start with one of these. (The first block is the list in CONTRACT2; the
// second block are routes/files the website also serves.)
export const RESERVED_FIRST_SEGMENTS = [
  "services",
  "industries",
  "schemes",
  "articles",
  "guides",
  "case-studies",
  "careers",
  "contact",
  "about",
  "resources",
  "advisers",
  "sessions",
  "team",
  "p",
  "api",
  "subsidy-viability-report",
  "how-we-work",
  "preview",
  "en",
  "hi",
  "_next",
  "sitemap.xml",
  "robots.txt",
  "home",
];

// Pages of the "managed" template: the website's own pages (About, Contact,
// Resources ...) whose text is edited in the dashboard but whose layout is
// still drawn by the website's own views. They live at the page's own path,
// which is normally reserved. "home" is the Home page (the site root).
export const MANAGED_PATHS = [
  "about",
  "contact",
  "resources",
  "schemes",
  "case-studies",
  "how-we-work",
  "home",
];
export const MANAGED_TEMPLATE = "managed";

const PATH_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_PATH_SEGMENTS = 5;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value) => typeof value === "string" && UUID.test(value);

// "Your-Project/Setting-Up/" -> "your-project/setting-up". Returns
// { ok: true, path } or { ok: false, error }.
// options.allowManaged: a managed page path (about, contact ...) is accepted
// here; checkTemplatePath() then ties it to the "managed" template.
export const validatePagePath = (value, { allowManaged = false } = {}) => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw.startsWith("/")) {
    return { ok: false, error: "Path must not start with a slash, for example your-project/setting-up" };
  }
  const path = raw.replace(/\/+$/, "");
  if (!path) return { ok: false, error: "Path is required" };
  const segments = path.split("/");
  if (segments.length > MAX_PATH_SEGMENTS) {
    return { ok: false, error: `Path can have at most ${MAX_PATH_SEGMENTS} parts` };
  }
  if (!segments.every((segment) => segment.length <= 80 && PATH_SEGMENT.test(segment))) {
    return {
      ok: false,
      error: "Path may only contain lowercase letters, numbers and hyphens, with / between parts",
    };
  }
  if (allowManaged && MANAGED_PATHS.includes(path)) return { ok: true, path };
  if (RESERVED_FIRST_SEGMENTS.includes(segments[0])) {
    return {
      ok: false,
      error: `"${segments[0]}" is already used by the website. Choose a different first part of the path`,
    };
  }
  return { ok: true, path };
};

// A managed page may only sit at one of MANAGED_PATHS, and no other template
// may use one of them. Returns an error message, or null when the pair is fine.
export const checkTemplatePath = (template, path) => {
  const managedPath = MANAGED_PATHS.includes(path);
  if (template === MANAGED_TEMPLATE && !managedPath) {
    return `A Managed page must use one of these paths: ${MANAGED_PATHS.join(", ")}`;
  }
  if (template !== MANAGED_TEMPLATE && managedPath) {
    return `"${path}" belongs to the Managed page of the website. Choose a different path`;
  }
  return null;
};

// ── Field helpers (build the Field objects the registry serves) ───────────

const text = (key, label, extra = {}) => ({ key, label, kind: "text", max: 200, ...extra });
const textarea = (key, label, extra = {}) => ({ key, label, kind: "textarea", max: 2000, ...extra });
const html = (key, label, extra = {}) => ({ key, label, kind: "html", max: 50000, ...extra });
const url = (key, label, extra = {}) => ({ key, label, kind: "url", max: 500, ...extra });
const image = (key, label, extra = {}) => ({ key, label, kind: "image", max: 500, ...extra });
const bool = (key, label, extra = {}) => ({ key, label, kind: "boolean", ...extra });
const select = (key, label, options, extra = {}) => ({
  key,
  label,
  kind: "select",
  options: options.map(([value, optionLabel]) => ({ value, label: optionLabel })),
  ...extra,
});
const list = (key, label, item_fields, extra = {}) => ({
  key,
  label,
  kind: "list",
  item_fields,
  max: 30,
  ...extra,
});
const record = (key, label, record_type, extra = {}) => ({
  key,
  label,
  kind: "record",
  record_type,
  multiple: true,
  max: 24,
  ...extra,
});

// Icons a hub hero card row can show (the website maps each key to a drawing).
const CARD_ICONS = [
  ["auto", "Automatic (by position)"],
  ["land", "Land and site"],
  ["build", "Build"],
  ["running", "Running and renewals"],
  ["investment", "Investment"],
  ["loan", "Loan"],
  ["sector", "Sector"],
  ["finance", "Finance"],
  ["insurance", "Insurance"],
  ["document", "Document"],
  ["claim", "Claim or file"],
];

const PRESET_KINDS = [
  ["enquiry", "Enquiry (callback request)"],
  ["contact", "Contact"],
];

// ── Blocks ─────────────────────────────────────────────────────────────────
// rail: true  = sits inside the sticky-enquiry-rail column on rail templates;
// rail: false = full width, ends the rail.

// The text of an enquiry form card (hero card or closing panel): every label,
// placeholder and button. Empty = the website's built-in wording.
function enquiryFormFields() {
  return [
    text("badge_text", "Form ribbon text", { max: 60, help: "For example FREE / FIRST REVIEW (a slash starts the second line)." }),
    text("name_label", "Name field label", { max: 60 }),
    text("name_placeholder", "Name field example text", { max: 80 }),
    text("phone_label", "Mobile field label", { max: 60 }),
    text("phone_placeholder", "Mobile field example text", { max: 80 }),
    text("select_label", "Choice field label", { max: 80, help: "For example: What do you need? Leave empty for no choice field." }),
    text("select_placeholder", "Choice field first option", { max: 80, help: "For example: Not sure yet." }),
    list("select_options", "Choice field options", [text("text", "Option", { required: true, max: 80 })], { max: 10 }),
    text("district_label", "District field label", { max: 60 }),
    text("district_placeholder", "District field example text", { max: 80 }),
    text("location_label", "Site location field label", { max: 80, help: "Only forms that ask for the site, for example Site location / village." }),
    text("location_placeholder", "Site location field example text", { max: 120 }),
    text("activity_label", "Free-text field label", { max: 80, help: "For example: Your unit." }),
    text("activity_placeholder", "Free-text field example text", { max: 120 }),
    text("required_label", "Tag for required fields", { max: 30, help: "For example Required." }),
    text("optional_label", "Tag for optional fields", { max: 30, help: "For example Optional." }),
    text("consent_label", "Consent checkbox text", { max: 300 }),
    text("submit_label", "Button label", { max: 80 }),
    text("helper", "Line under the button", { max: 200, help: "For example: A Rapid expert will call you." }),
    text("whatsapp_label", "WhatsApp button label", { max: 80 }),
  ];
}

const DEFAULT_VARIANT = [{ key: "default", label: "Default" }];

const BLOCK_DEFS = {
  masthead: {
    label: "Masthead",
    description: "The opening block: small label, page heading, introduction and the main actions.",
    rail: false,
    variants: [
      { key: "default", label: "Default" },
      { key: "split", label: "Split (text with image)" },
      { key: "hero", label: "Hero with a choice card (hub pages)" },
      { key: "content", label: "Content hero with a video card (situation and resource pages)" },
    ],
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80 }),
      text("heading", "Heading", { max: 200, help: "Shown as the page heading (H1)." }),
      html("intro_html", "Introduction", { max: 5000 }),
      text("primary_cta_label", "Main button label", { max: 60, help: "Opens the enquiry form." }),
      bool("show_whatsapp", "Show the WhatsApp button"),
      image("image", "Image (optional)", { help: "Used by the Split variant." }),
      text("image_alt", "Image description", { max: 200, help: "Describe the image for people who cannot see it." }),
      // Hero variant only (ignored by the other variants).
      list(
        "highlights",
        "Hero: highlights",
        [text("title", "Highlight", { required: true, max: 120 }), textarea("text", "Supporting line", { max: 300 })],
        { max: 4, help: "Hero and Content variants: up to three short rows with an icon, under the introduction." },
      ),
      text("footnote", "Hero: footnote", { max: 300, help: "Hero and Content variants: small print under the buttons, for example what an asterisk refers to." }),
      text("card_title", "Hero: choice card title", { max: 100, help: "Hero variant: heading of the card on the right." }),
      text("seal_value", "Hero: seal figure", {
        max: 20,
        help: "Hero variant: the figure shown in the round seal on the card (for example 95%). Leave empty for no seal.",
      }),
      text("seal_label", "Hero: seal label", { max: 40, help: "Hero variant: the words under the seal figure." }),
      select(
        "card_style",
        "Hero: card row style",
        [
          ["numbered", "Numbered rows"],
          ["icons", "Rows with an icon"],
        ],
        { help: "Hero variant: how the rows of the card look." },
      ),
      list(
        "card_items",
        "Hero: choice card rows",
        [
          text("title", "Row title", { required: true, max: 80 }),
          text("text", "Row text", { max: 200 }),
          text("target", "Section to scroll to", {
            max: 60,
            help: "The anchor of a section on this page (shown as the section's anchor in its settings, for example buying-land).",
          }),
          url("href", "Link to another page (optional)", {
            help: "Used instead of the section above when filled in, for example /schemes.",
          }),
          select("icon", "Icon (rows with an icon)", CARD_ICONS, {
            help: "Only for the \"Rows with an icon\" style. Automatic picks one by position.",
          }),
        ],
        { max: 8, help: "Hero variant: rows in the card. Each row scrolls to a section of this page, or opens a page." },
      ),
      text("nav_label", "Sticky menu: lead label", {
        max: 80,
        help: "Words shown before the jump links of the sticky menu, for example \"Choose your project status:\". On a hub page the sticky menu is shown only when this is filled in.",
      }),
      // Content variant only: the video card beside the introduction.
      text("video_label", "Video card: small label", {
        max: 60,
        help: "Content variant: for example Watch instead of reading. Leave the title and the link empty for no video card.",
      }),
      text("video_title", "Video card: title", { max: 160, help: "Content variant." }),
      textarea("video_text", "Video card: description", {
        max: 300,
        help: "Content variant: one line under the video card title.",
      }),
      text("video_meta", "Video card: length and notes", {
        max: 80,
        help: "Content variant: for example 2:00 · Captions on.",
      }),
      url("video_url", "Video card: video link", {
        help: "Content variant: a YouTube or Vimeo address or a video file. With the title filled in and no link, a clearly labelled placeholder shows.",
      }),
      // Rail templates: the page's own form card in the side rail.
      text("rail_title", "Rail form: title", {
        max: 120,
        help: "Situation and other rail pages. Fill this in to show this page's own form card (with the free-review seal) in the side rail. Leave empty to keep the standard enquiry panel.",
      }),
      textarea("rail_hint", "Rail form: line under the title", { max: 300 }),
      text("rail_select_label", "Rail form: choice field label", {
        max: 80,
        help: "For example Where is your project? Leave empty for no choice field.",
      }),
      list("rail_select_options", "Rail form: choices", [text("text", "Choice", { required: true, max: 80 })], {
        max: 10,
        help: "The options of the choice field.",
      }),
      text("rail_select_default", "Rail form: preselected choice", {
        max: 80,
        help: "Must be one of the choices above, for example Setting up.",
      }),
      text("rail_activity_label", "Rail form: last field label", {
        max: 80,
        help: "For example What are you working on? Leave empty to use that wording.",
      }),
      text("rail_submit_label", "Rail form: button label", { max: 60 }),
      text("rail_helper", "Rail form: line under the button", { max: 200 }),
      text("rail_badge_text", "Rail form: ribbon text", {
        max: 60,
        help: "For example FREE / FIRST REVIEW (a slash starts the second line). Empty keeps the standard ribbon.",
      }),
      text("rail_required_label", "Rail form: tag for required fields", { max: 30, help: "For example Required." }),
      text("rail_optional_label", "Rail form: tag for optional fields", { max: 30, help: "For example Optional." }),
      text("rail_name_placeholder", "Rail form: name field example text", { max: 80 }),
      text("rail_phone_placeholder", "Rail form: mobile field example text", { max: 80 }),
      text("rail_district_placeholder", "Rail form: district field example text", { max: 80 }),
      text("rail_site_label", "Rail form: site field label", {
        max: 80,
        help: "For example Village / khasra. Leave empty for no site field.",
      }),
      text("rail_site_placeholder", "Rail form: site field example text", { max: 120 }),
      text("rail_activity_placeholder", "Rail form: last field example text", { max: 120 }),
    ],
    defaults: { primary_cta_label: "Discuss your project", show_whatsapp: true, card_style: "numbered" },
  },

  rich_text: {
    label: "Text",
    description: "A heading and formatted text.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [text("heading", "Heading"), html("html", "Text", { required: true })],
  },

  steps: {
    label: "Steps",
    description: "A numbered list of steps.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      list("items", "Steps", [
        text("title", "Step title", { required: true }),
        textarea("text", "Step text"),
      ]),
      text("eyebrow", "Small label above the heading", { max: 120, help: "Managed pages." }),
      text("cta_label", "Button label", { max: 60, help: "Managed pages." }),
      url("cta_href", "Button link", { help: "Managed pages." }),
    ],
  },

  card_grid: {
    label: "Card grid",
    description: "A grid of cards, each with a title, short text and an optional link.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      select(
        "columns",
        "Cards per row",
        [
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
        ],
        { help: "On narrow screens cards stack automatically." },
      ),
      list("items", "Cards", [
        text("title", "Card title", { required: true }),
        textarea("text", "Card text", { max: 600 }),
        url("href", "Link", { help: "A page on this site (for example /services/...) or a full web address." }),
        text("link_label", "Link label", { max: 60 }),
      ]),
    ],
    defaults: { columns: "3" },
  },

  stage_chooser: {
    label: "Stage chooser",
    description:
      "Cards for the stages of a project. Each stage has a section below it and a button that opens the enquiry form.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      list(
        "stages",
        "Stages",
        [
          text("key", "Key", { max: 60, slug_from: "title", help: "Used in the link to this stage. Made from the title if left empty." }),
          text("title", "Stage title", { required: true }),
          textarea("text", "Stage text", { max: 600 }),
          text("primary_label", "Button label", { max: 60 }),
          url("page_href", "Page for this stage (optional)", {
            help: "Leave empty until a page for this stage exists. Shown as a second link only when set.",
          }),
        ],
        { max: 12 },
      ),
    ],
  },

  stage_section: {
    label: "Stage section",
    description:
      "One stage or step of a journey: label, heading and text on the left, a side card of common mistakes or \"you will need these if\" rows on the right, a row of service cards and two buttons. Light or navy.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80, help: "For example: Stage 1 - Buying land. Shown in capitals." }),
      text("title", "Heading", { max: 200, required: true }),
      textarea("body", "Text", { max: 2000 }),
      select(
        "tone",
        "Background",
        [
          ["light", "Light"],
          ["navy", "Navy"],
        ],
        { help: "Navy gives the section a dark band with white text." },
      ),
      select(
        "side_kind",
        "Side card type",
        [
          ["mistakes", "Common mistakes (each row has an information icon)"],
          ["needs", "You will need these if (each row is a condition with a link)"],
        ],
        { help: "Leave the side card title and rows empty to show no side card." },
      ),
      text("side_title", "Side card title", { max: 80, help: "For example: Common mistakes. Shown in capitals." }),
      list(
        "side_items",
        "Side card rows",
        [
          text("text", "Row text", { required: true, max: 300 }),
          text("link_label", "Link text", { max: 80, help: "Only for the \"You will need these if\" type, for example Change of Land Use (CLU)." }),
          url("link_href", "Link", { help: "A page on this site (for example /services/change-in-land-use-clu). Leave empty for no link." }),
        ],
        { max: 8 },
      ),
      text("services_label", "Service cards label", { max: 80, help: "Small label above the cards. Leave empty to use \"Services we provide\"." }),
      list(
        "services",
        "Service cards",
        [
          text("title", "Card title", { required: true, max: 120 }),
          textarea("hint", "Two-line hint", { max: 200 }),
          url("href", "Link", { help: "The service page this card opens. Leave empty if there is no page yet: the card then shows without a link." }),
        ],
        { max: 12 },
      ),
      text("primary_cta_label", "Main button label", { max: 60 }),
      select(
        "primary_cta_action",
        "Main button action",
        [
          ["enquiry", "Open the enquiry form with this stage selected"],
          ["scroll_form", "Scroll to the form at the end of the page"],
          ["link", "Go to a page"],
          ["whatsapp", "Open WhatsApp"],
        ],
      ),
      text("primary_cta_preset", "Main button: stage to preselect", {
        max: 60,
        help: "Recorded with the enquiry so Rapid knows which stage it came from, for example buying-land. Used by the enquiry form action.",
      }),
      url("primary_cta_href", "Main button: link", { help: "For \"Go to a page\", or the section to scroll to (for example #enquiry-form)." }),
      text("secondary_cta_label", "Second button label", { max: 60 }),
      url("secondary_cta_href", "Second button: link", {
        help: "Leave empty and the button shows as not available yet (it does nothing). Use this while the page it will lead to is not built.",
      }),
    ],
    defaults: { tone: "light", side_kind: "mistakes", primary_cta_action: "enquiry" },
  },

  linked_schemes: {
    label: "Linked schemes",
    description: "Scheme cards pulled from the scheme directory. Editing a scheme updates every page that shows it.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      record("records", "Schemes", "scheme"),
      url("view_all_href", "\"View all\" link"),
    ],
  },

  linked_services: {
    label: "Linked services",
    description: "Service cards pulled from the services list. Editing a service updates every page that shows it.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      record("records", "Services", "service"),
      url("view_all_href", "\"View all\" link"),
    ],
  },

  linked_cases: {
    label: "Linked case studies",
    description: "Case study cards pulled from the case studies list. Editing a case updates every page that shows it.",
    rail: true,
    variants: [
      { key: "default", label: "Default (grid)" },
      { key: "carousel", label: "Carousel (one row with previous / next)" },
    ],
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      record("records", "Case studies", "case_study"),
      url("view_all_href", "\"View all\" link"),
    ],
  },

  linked_articles: {
    label: "Linked articles",
    description: "Article and guide cards pulled from the articles list. Editing an article updates every page that shows it.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      record("records", "Articles", "article"),
      url("view_all_href", "\"View all\" link"),
    ],
  },

  people: {
    label: "People",
    description: "Team member cards pulled from the team list. Editing a person updates every page that shows them.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      record("records", "People", "adviser"),
    ],
  },

  faq: {
    label: "Questions and answers",
    description: "A list of questions that open to show the answer. Adds FAQ structured data for the visible questions.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      list(
        "items",
        "Questions",
        [text("question", "Question", { required: true, max: 300 }), html("answer_html", "Answer", { required: true, max: 10000 })],
        { max: 40 },
      ),
    ],
  },

  faq_hub: {
    label: "FAQ hub",
    description: "Questions grouped under topic tabs. A topic can be opened from a link with ?topic=<key>.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      list(
        "topics",
        "Topics",
        [
          text("key", "Key", { max: 60, slug_from: "title", help: "Used in the link ?topic=<key>. Made from the title if left empty." }),
          text("title", "Topic title", { required: true, max: 120 }),
          list(
            "items",
            "Questions",
            [text("question", "Question", { required: true, max: 300 }), html("answer_html", "Answer", { required: true, max: 10000 })],
            { max: 40 },
          ),
        ],
        { max: 12 },
      ),
    ],
  },

  video: {
    label: "Video",
    description: "An explainer video with a caption and a text version. A placeholder is shown when no video is set.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("caption", "Caption", { max: 500 }),
      url("video_url", "Video link", { help: "Link to the video (for example a YouTube or Vimeo address)." }),
      html("transcript_html", "Text version of the video", { max: 20000 }),
    ],
  },

  comparison: {
    label: "Comparison table",
    description: "A table comparing options side by side.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      list("columns", "Columns", [text("text", "Column heading", { required: true, max: 120 })], { max: 6 }),
      list(
        "rows",
        "Rows",
        [
          text("label", "Row label", { required: true, max: 200 }),
          textarea("values", "Cell text", {
            max: 2000,
            help: "One line per column, in the same order as the columns.",
          }),
        ],
        { max: 30 },
      ),
    ],
  },

  callout: {
    label: "Callout",
    description: "A highlighted note.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      select(
        "tone",
        "Tone",
        [
          ["info", "Information"],
          ["caution", "Caution"],
          ["note", "Note"],
        ],
      ),
      html("html", "Text", { required: true, max: 5000 }),
    ],
    defaults: { tone: "info" },
  },

  documents_checklist: {
    label: "Documents checklist",
    description: "A checklist of documents or items to have ready.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      list("items", "Items", [text("title", "Item", { required: true }), textarea("text", "Why it helps", { max: 600 })], {
        max: 40,
      }),
    ],
  },

  cta_panel: {
    label: "Closing call to action",
    description: "A full-width closing panel with a heading, a line of text and a button that opens the enquiry form.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("text", "Text", { max: 600 }),
      text("button_label", "Button label", { max: 60 }),
      select("preset_kind", "Form", PRESET_KINDS, { help: "Which approved form the button opens." }),
    ],
    defaults: { button_label: "Request a callback", preset_kind: "enquiry" },
  },

  enquiry_form: {
    label: "Enquiry form",
    description: "A full-width enquiry form section.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading"),
      textarea("intro", "Introduction", { max: 1000 }),
      select("preset_kind", "Form", PRESET_KINDS, { help: "Which approved form is shown." }),
      text("preset_stage", "Stage (optional)", { max: 60, help: "Recorded with the enquiry, for example a stage key." }),
    ],
    defaults: { preset_kind: "enquiry" },
  },

  // ── Blocks added for the Figma hubs and the situation page ──────────────

  logo_strip: {
    label: "Client logo strip",
    description:
      "A scrolling row of grey placeholder tiles under a small heading, for example \"Businesses that trust Rapid.\". The tiles carry no brand names; real logos are added once Rapid supplies them.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80, help: "For example: Our clients." }),
      text("heading", "Heading", { max: 120 }),
      {
        key: "count",
        label: "Number of placeholder tiles",
        kind: "number",
        min: 3,
        max: 12,
        help: "Between 3 and 12.",
      },
    ],
    defaults: { heading: "Businesses that trust Rapid.", count: 7 },
  },

  mistakes_claim: {
    label: "Mistakes and stuck claim",
    description:
      "A sage band with a centred heading and two cards: \"Common mistakes\" (rows with an information icon) and a \"Claim stuck?\" card with a button that opens the enquiry form.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80, help: "For example: Where subsidies get lost." }),
      text("heading", "Heading (centred)", { max: 200, required: true }),
      text("mistakes_title", "Mistakes card title", { max: 80, help: "Shown in capitals." }),
      list("mistakes", "Mistakes", [text("text", "Mistake", { required: true, max: 300 })], { max: 8 }),
      text("claim_title", "Claim card title", { max: 80, help: "Shown in capitals, for example Claim stuck?" }),
      textarea("claim_text", "Claim card text", { max: 600 }),
      text("claim_cta_label", "Claim card button label", { max: 60 }),
      text("claim_cta_preset", "Claim card button: stage to record", {
        max: 60,
        help: "Recorded with the enquiry so Rapid knows where it came from, for example subsidy-claim-stuck.",
      }),
    ],
    defaults: { mistakes_title: "Common mistakes", claim_title: "Claim stuck?" },
  },

  timeline_steps: {
    label: "Timeline steps",
    description:
      "Numbered step cards in a row (01, 02, 03 ...), the last one highlighted, with an optional button that opens the enquiry form.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80 }),
      text("heading", "Heading", { max: 200 }),
      textarea("intro", "Introduction", { max: 1000 }),
      list(
        "items",
        "Steps",
        [text("title", "Step title", { required: true, max: 120 }), textarea("text", "Step text", { max: 400 })],
        { max: 6 },
      ),
      bool("highlight_last", "Highlight the last step", { help: "For example the step where the payment arrives." }),
      text("cta_label", "Button label", { max: 60, help: "Leave empty for no button." }),
      text("cta_preset", "Button: stage to record", { max: 60, help: "Recorded with the enquiry, for example subsidy-eligibility." }),
    ],
    defaults: { highlight_last: true },
  },

  scheme_search: {
    label: "Scheme search",
    description:
      "A search box that opens the scheme directory with the words typed in (/schemes?q=...), and a row of shortcut chips.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80, help: "For example: Find a subsidy." }),
      text("heading", "Heading", { max: 200 }),
      textarea("intro", "Introduction", { max: 600 }),
      text("search_label", "Search box label", { max: 120 }),
      text("placeholder", "Search box example text", { max: 120, help: "For example: CGTMSE, AIF, stamp duty, machinery." }),
      text("button_label", "Search button label", { max: 40 }),
      list(
        "chips",
        "Shortcut chips",
        [
          text("label", "Chip label", { required: true, max: 60 }),
          text("term", "Search words", {
            max: 80,
            help: "Opens the scheme directory searched for these words (/schemes?q=...).",
          }),
          text("topic", "Directory topic", {
            max: 80,
            help: "Opens the scheme directory on one of its topics (for example Investment & finance). Used when no search words are given.",
          }),
          url("href", "Link to another page or section", {
            help: "Used instead of the two fields above when filled in, for example #on-your-loan or /schemes.",
          }),
        ],
        { max: 8, help: "A chip with none of the three fields opens the whole scheme directory." },
      ),
    ],
    defaults: { search_label: "Search by subsidy, scheme or expense", button_label: "Search" },
  },

  reviews_carousel: {
    label: "Client reviews carousel",
    description:
      "The same client reviews carousel as the Home page (rating box, review cards, \"View all reviews\" disabled until the reviews archive exists). The reviews are sample content until Rapid supplies verified ones.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label (optional)", { max: 80, help: "Leave empty for the Home wording." }),
      text("heading", "Heading (optional)", { max: 200, help: "Leave empty for the Home wording." }),
      textarea("intro", "Introduction (optional)", { max: 600, help: "Leave empty for the Home wording." }),
      // Managed pages: the rating box, the review cards and the button.
      text("rating_label", "Rating box: label", { max: 60, help: "For example Overall rating." }),
      text("rating_value", "Rating box: figure", { max: 10, help: "Leave empty until the real rating is confirmed." }),
      text("rating_count", "Rating box: number of reviews", { max: 60 }),
      text("rating_source", "Rating box: source", { max: 80 }),
      text("trust_label", "Card small caps line", { max: 80, help: "For example TRUSTED BY GROWING BUSINESSES." }),
      text("services_label", "Card services label", { max: 60, help: "For example SERVICES TAKEN." }),
      list(
        "items",
        "Review cards",
        [
          textarea("quote", "Review", { required: true, max: 600 }),
          text("name", "Client name", { max: 120 }),
          text("business", "Business name", { max: 120 }),
          text("location", "Place", { max: 120 }),
          text("rating", "Rating pill", { max: 20, help: "For example 5." }),
          list("services", "Services taken", [text("text", "Service", { required: true, max: 80 })], { max: 4 }),
        ],
        { max: 12 },
      ),
      text("cta_label", "Button label", { max: 60 }),
      url("cta_href", "Button link"),
    ],
  },

  closing_panel: {
    label: "Closing enquiry panel",
    description:
      "The navy closing panel with a heading and photo placeholder on the left and a white enquiry card on the right (name, mobile, an optional choice, district, a free-text line and consent).",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80 }),
      text("heading", "Heading", { max: 200, required: true }),
      textarea("intro", "Introduction", { max: 600 }),
      text("photo_note", "Photo placeholder note", {
        max: 200,
        help: "Shown on the photo placeholder, for example: Placeholder: a factory site in Haryana. Licensed or commissioned, labelled as representative.",
      }),
      text("form_title", "Form title", { max: 120, required: true }),
      textarea("form_hint", "Line under the form title", { max: 300 }),
      bool("show_seal", "Show the \"Free first review\" seal"),
      text("select_label", "Choice field label", { max: 80, help: "For example: What do you need? Leave empty for no choice field." }),
      bool("select_required", "Choice field is required"),
      text("select_placeholder", "Choice field first option", { max: 80, help: "For example: Not sure yet." }),
      list("select_options", "Choice field options", [text("text", "Option", { required: true, max: 80 })], { max: 10 }),
      bool("show_district", "Show the district field"),
      bool("show_activity", "Show the free-text field"),
      text("activity_label", "Free-text field label", { max: 80, help: "For example: Your unit." }),
      text("submit_label", "Button label", { max: 60 }),
      text("helper", "Line under the button", { max: 200, help: "For example: A Rapid expert will call you." }),
      text("source", "Recorded source", {
        max: 60,
        help: "Recorded with the enquiry so Rapid knows which page it came from, for example hub-finance. Made from the page path if left empty.",
      }),
      // Managed pages: the rest of the form's wording (empty = built-in wording).
      ...enquiryFormFields().filter(
        (field) => !["select_label", "select_placeholder", "select_options", "activity_label", "submit_label", "helper"].includes(field.key),
      ),
    ],
    defaults: { show_seal: true, show_district: true, show_activity: true, submit_label: "Get my next steps" },
  },

  qa_list: {
    label: "Quick answers",
    description:
      "A grey card of question and answer rows (question in bold, answer beside it) under a small \"Summary\" label. Answers can carry links.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80 }),
      text("heading", "Heading", { max: 200 }),
      textarea("intro", "Introduction", { max: 1000 }),
      text("summary_label", "Label on the card", { max: 40, help: "Shown in capitals, for example Summary." }),
      list(
        "items",
        "Questions and answers",
        [text("question", "Question", { required: true, max: 300 }), html("answer_html", "Answer", { required: true, max: 5000 })],
        { max: 12 },
      ),
      text("footnote", "Line under the card", { max: 300, help: "For example: Rules last checked on a date." }),
    ],
    defaults: { summary_label: "Summary" },
  },

  case_tiles: {
    label: "Case tiles",
    description:
      "A row of case tiles (title, place, sector, Rapid's role) with previous / next. Use it for sample cases while real case studies are being published; the tiles are then labelled as samples.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80 }),
      text("heading", "Heading", { max: 200 }),
      textarea("intro", "Introduction", { max: 1000 }),
      bool("sample", "Label the tiles as sample cases", {
        help: "Keep this on until the tiles are real, published cases.",
      }),
      list(
        "items",
        "Tiles",
        [
          text("title", "Tile title", { required: true, max: 160 }),
          text("location", "Place", { max: 120 }),
          text("sector", "Sector", { max: 120 }),
          text("role", "Rapid's role", { max: 200 }),
          url("href", "Link (optional)", { help: "A case study page, if there is one." }),
        ],
        { max: 12 },
      ),
      url("view_all_href", "\"View all\" link"),
    ],
    defaults: { sample: true },
  },

  quote_cards: {
    label: "Quote cards",
    description:
      "Navy tiles in a row with previous / next, each with a statement owners hear and an optional note under it (for example \"What you may hear\").",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80 }),
      text("heading", "Heading", { max: 200 }),
      textarea("intro", "Introduction", { max: 1000 }),
      list(
        "items",
        "Tiles",
        [
          textarea("quote", "What is said", { required: true, max: 300 }),
          text("note_label", "Note label", { max: 40, help: "Shown in capitals, for example The portal." }),
          textarea("note", "Note", { max: 500, help: "What to check, in plain words." }),
        ],
        { max: 12 },
      ),
    ],
  },

  roadmap_timeline: {
    label: "Route timeline",
    description:
      "A numbered route (01, 02, 03 ...). Each step has rows that start with a bold lead, and link chips to the pages for that step.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 80 }),
      text("heading", "Heading", { max: 200 }),
      textarea("intro", "Introduction", { max: 1000 }),
      list(
        "items",
        "Steps",
        [
          text("title", "Step title", { required: true, max: 120 }),
          list(
            "rows",
            "Rows",
            [text("lead", "Bold lead", { max: 120 }), textarea("text", "Text after the lead", { max: 500 })],
            { max: 10 },
          ),
          list(
            "links",
            "Link chips",
            [text("label", "Chip label", { required: true, max: 60 }), url("href", "Link", { help: "A page on this site." })],
            { max: 8 },
          ),
        ],
        { max: 8 },
      ),
      text("cta_label", "Button label", { max: 60, help: "Leave empty for no button." }),
      text("cta_preset", "Button: stage to record", { max: 60 }),
    ],
  },

  // ── Blocks for the Managed pages (About, Contact, Resources, Scheme
  //    directory, Case archive, How we work, Home) ─────────────────────────
  // Generic and reusable: the website's own views read their text from these.

  page_hero: {
    label: "Page hero",
    description:
      "The opening band of a page: breadcrumb, small label, page heading, introduction, benefit rows, buttons and a card on the right (rows, a search card or an enquiry form).",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      list(
        "breadcrumb",
        "Breadcrumb",
        [text("label", "Label", { required: true, max: 80 }), url("href", "Link", { help: "Leave empty for the current page." })],
        { max: 5, help: "For example Home, then About. Leave empty for the website's default." },
      ),
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading (H1)", { max: 300, required: true }),
      textarea("intro", "Introduction", { max: 1000 }),
      list("bullets", "Benefit rows", [text("title", "Bold line", { required: true, max: 120 }), textarea("text", "Supporting line", { max: 300 })], {
        max: 4,
        help: "Short rows with an icon under the introduction.",
      }),
      text("primary_label", "Main button label", { max: 60, help: "For example Discuss your project. Opens the enquiry form unless a link is set." }),
      url("primary_href", "Main button link (optional)"),
      text("secondary_label", "WhatsApp button label", { max: 80, help: "For example WhatsApp +91 94672 48028." }),
      url("secondary_href", "WhatsApp button link (optional)"),
      list("links", "Contact links", [text("label", "Link text", { required: true, max: 160 }), url("href", "Link", { help: "tel:, mailto: or a web address." })], {
        max: 6,
        help: "Underlined lines under the introduction, for example Call or WhatsApp.",
      }),
      text("plain_text", "Plain line under the links", { max: 200, help: "For example Office: Old Court Road, Hisar." }),
      text("footnote", "Footnote", { max: 300 }),
      text("nav_label", "Sticky menu: lead label", {
        max: 80,
        help: "Words before the jump links of the sticky menu, for example Find answers:. The links come from the labels of the sections below. Leave empty for no sticky menu.",
      }),
      select(
        "card_kind",
        "Card on the right",
        [
          ["none", "No card"],
          ["rows", "Rows (label and value or line)"],
          ["search", "Search card"],
          ["form", "Enquiry form card"],
        ],
      ),
      text("card_eyebrow", "Card: small label", { max: 120 }),
      text("card_title", "Card: title", { max: 160 }),
      textarea("card_text", "Card: line under the title", { max: 300 }),
      list(
        "card_rows",
        "Card: rows",
        [
          text("label", "Bold label or link text", { required: true, max: 200 }),
          text("text", "Value or lighter line", { max: 300 }),
          url("href", "Link (optional)"),
        ],
        { max: 10, help: "Rows card: label and value. Search card: popular questions (label and link)." },
      ),
      text("search_label", "Search: field label", { max: 120 }),
      text("search_placeholder", "Search: example text", { max: 160 }),
      text("search_button", "Search: button label", { max: 40 }),
      text("popular_label", "Search: label above the shortcuts", { max: 80, help: "For example Popular questions or Popular:." }),
      list(
        "chips",
        "Search: shortcut chips",
        [text("label", "Chip label", { required: true, max: 60 }), text("term", "Search words", { max: 80 })],
        { max: 8 },
      ),
      ...enquiryFormFields(),
      list("form_tabs", "Form: toggle options", [text("label", "Option", { required: true, max: 60 }), text("submit_label", "Button label for this option", { max: 80 })], {
        max: 3,
        help: "For example Approval check and Subsidy check. The button label changes with the option.",
      }),
      text("form_error", "Form: consent error text", { max: 200 }),
    ],
    defaults: { card_kind: "none" },
  },

  stats_strip: {
    label: "Numbers strip",
    description: "A strip of figures with labels and a highlighted panel. A figure left empty shows the website's placeholder.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("heading", "Heading", { max: 160 }),
      list("items", "Figures", [text("value", "Figure", { max: 30 }), text("label", "Label", { required: true, max: 80 })], { max: 6 }),
      text("panel_value", "Panel: figure", { max: 30 }),
      text("panel_label", "Panel: label", { max: 100 }),
    ],
  },

  data_table: {
    label: "Table with links",
    description: "A three-column table (bold first column, plain second column, third column with an optional link) with a closing line and a button.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      textarea("intro", "Introduction", { max: 1000 }),
      list("columns", "Column headings", [text("text", "Heading", { required: true, max: 120 })], { max: 4 }),
      list(
        "rows",
        "Rows",
        [
          text("cell_1", "First column (bold)", { required: true, max: 300 }),
          text("cell_2", "Second column", { max: 300 }),
          text("cell_3", "Third column", { max: 300 }),
          url("link_href", "Third column link (optional)"),
        ],
        { max: 12 },
      ),
      text("closing_text", "Closing line", { max: 300 }),
      text("cta_label", "Button label", { max: 60 }),
      url("cta_href", "Button link (optional)", { help: "Empty opens the enquiry form." }),
    ],
  },

  feature_cards: {
    label: "Feature cards",
    description:
      "A heading and a set of cards (grid or carousel). Each card can carry a type tag, a stage label, a title, text, a meta line, a note and a button. Also used for status legends and small link cards.",
    rail: true,
    variants: [
      { key: "default", label: "Grid" },
      { key: "carousel", label: "Carousel with previous / next" },
    ],
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      textarea("intro", "Introduction", { max: 1000 }),
      text("filter_label", "Filter chips: lead label", { max: 60 }),
      list("filters", "Filter chips", [text("text", "Chip", { required: true, max: 60 })], { max: 10 }),
      list(
        "items",
        "Cards",
        [
          text("tag", "Tag (type or status)", { max: 80, help: "For example GUIDE, a topic or a status pill." }),
          text("kicker", "Stage label", { max: 80 }),
          text("title", "Title", { required: true, max: 200 }),
          textarea("text", "Text", { max: 600 }),
          text("meta", "Meta line", { max: 200 }),
          text("note", "Note", { max: 200 }),
          url("href", "Link (optional)"),
          text("cta_label", "Button label", { max: 60 }),
        ],
        { max: 24 },
      ),
      text("footer_text", "Line under the cards", { max: 300 }),
      text("cta_label", "Section button label", { max: 60 }),
      url("cta_href", "Section button link"),
    ],
  },

  team_cards: {
    label: "People cards",
    description: "Cards for people with a portrait placeholder, a tag, name, role and a profile link. Not linked to the team list.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      textarea("intro", "Introduction", { max: 1000 }),
      list(
        "items",
        "People",
        [
          text("initials", "Portrait initials", { max: 6 }),
          text("caption", "Portrait caption", { max: 80 }),
          text("tag", "Tag", { max: 60, help: "For example LEADERSHIP." }),
          text("name", "Name", { max: 120 }),
          text("role", "Role", { max: 160 }),
          text("detail", "Small grey line", { max: 160 }),
          url("href", "Profile link (optional)"),
          text("link_label", "Link label", { max: 60 }),
        ],
        { max: 8 },
      ),
      text("footer_text", "Line under the cards", { max: 300 }),
      text("cta_label", "Button label", { max: 60 }),
      url("cta_href", "Button link"),
    ],
  },

  case_cards: {
    label: "Case cards",
    description:
      "Cards for projects: a figure panel (label, amount, caption, status), a title, detail rows and a button. Optionally with industry filter chips and a count line.",
    rail: true,
    variants: [
      { key: "default", label: "Grid" },
      { key: "carousel", label: "Carousel with previous / next" },
    ],
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      textarea("intro", "Introduction", { max: 1000 }),
      text("filter_label", "Filter chips: lead label", { max: 60 }),
      text("all_label", "Filter chips: first chip", { max: 40, help: "For example All." }),
      list("filters", "Filter chips", [text("text", "Chip", { required: true, max: 80 })], { max: 10 }),
      text("count_template", "Count line", { max: 120, help: "Use {shown} and {total}, for example Showing {shown} of {total} cases." }),
      list(
        "items",
        "Cases",
        [
          text("panel_label", "Panel: label", { max: 120, help: "For example DRAFT CASE · EQUIPMENT SPEND." }),
          text("amount", "Panel: figure", { max: 40 }),
          text("caption", "Panel: caption", { max: 160 }),
          text("status", "Panel: status", { max: 80, help: "For example Application filed." }),
          text("date_label", "Panel: date label", { max: 60 }),
          text("date_value", "Panel: date", { max: 40 }),
          text("title", "Title", { required: true, max: 200 }),
          list(
            "rows",
            "Detail rows",
            [text("label", "Label", { required: true, max: 60 }), text("value", "Value", { max: 160 }), url("href", "Link (optional)")],
            { max: 5 },
          ),
          text("cta_label", "Button label", { max: 60 }),
          url("href", "Button link"),
        ],
        { max: 12 },
      ),
      text("footnote", "Footnote", { max: 400 }),
      text("cta_label", "Section button label", { max: 60 }),
      url("cta_href", "Section button link"),
    ],
  },

  faq_accordion: {
    label: "Questions (accordion)",
    description:
      "Questions that open to show the answer, with a small label, heading and a button. A question without an answer is shown closed and empty until an answer is written.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      textarea("intro", "Introduction", { max: 1000 }),
      list("items", "Questions", [text("question", "Question", { required: true, max: 300 }), html("answer_html", "Answer", { max: 10000 })], { max: 40 }),
      text("cta_label", "Button label", { max: 60 }),
      url("cta_href", "Button link"),
    ],
  },

  banner: {
    label: "Banner",
    description: "A full-width band (navy or light) with a small label, heading, sub-heading, text and up to two buttons.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      text("subheading", "Sub-heading", { max: 300 }),
      textarea("text", "Text", { max: 1000 }),
      text("primary_label", "Main button label", { max: 60 }),
      url("primary_href", "Main button link", { help: "Empty opens the enquiry form." }),
      text("secondary_label", "Second button label", { max: 60 }),
      url("secondary_href", "Second button link"),
      select(
        "tone",
        "Background",
        [
          ["navy", "Navy"],
          ["light", "Light"],
        ],
      ),
      image("image", "Image (optional)"),
      text("image_alt", "Image description", { max: 200 }),
      text("photo_note", "Photo placeholder note", {
        max: 300,
        help: "Shown in a dashed photo placeholder when there is no image, for example: Placeholder: a factory site in Haryana.",
      }),
    ],
    defaults: { tone: "navy" },
  },

  directory: {
    label: "Searchable list",
    description:
      "A heading with an optional search box, filter chip groups, a count line, a list of rows (title, tag, topic, meta line, status pill) and buttons. The website fills live lists (schemes, articles) from its own data; the rows here are for featured or fixed lists.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      textarea("intro", "Introduction", { max: 1000 }),
      text("search_label", "Search: field label", { max: 120 }),
      text("search_placeholder", "Search: example text", { max: 160 }),
      text("search_button", "Search: button label", { max: 40 }),
      list(
        "groups",
        "Filter groups",
        [
          text("label", "Group label", { max: 80, help: "For example What it pays back:. Leave empty for a group without a label." }),
          list("chips", "Chips", [text("text", "Chip", { required: true, max: 80 })], { max: 12 }),
        ],
        { max: 4 },
      ),
      text("all_label", "First chip of each group", { max: 40, help: "For example All. Leave empty for no all-chip." }),
      text("clear_label", "Clear filters label", { max: 40 }),
      text("count_template", "Count line", { max: 160, help: "Use {shown} and {total}, for example Showing {shown} of {total} schemes." }),
      text("empty_text", "Text when nothing matches", { max: 200 }),
      text("more_label", "Show more button label", { max: 40 }),
      list(
        "items",
        "Rows",
        [
          text("title", "Title", { required: true, max: 240 }),
          text("tag", "Type tag", { max: 60, help: "For example Guide or Article." }),
          text("topic", "Topic", { max: 80 }),
          text("meta", "Meta line", { max: 240 }),
          text("extra", "Extra line", { max: 200 }),
          text("pill", "Status pill", { max: 60 }),
          url("href", "Link (optional)"),
        ],
        { max: 30 },
      ),
      text("cta_label", "Button label", { max: 60 }),
      url("cta_href", "Button link"),
    ],
  },

  tabs_panel: {
    label: "Tabbed panel",
    description:
      "A heading above tabs. Each tab has a title, text, question chips, a note block, a callout, small cards and a button. Used for service tabs and the situation selector.",
    rail: true,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      textarea("intro", "Introduction", { max: 1000 }),
      select(
        "tab_layout",
        "Tabs",
        [
          ["top", "Across the top"],
          ["side", "Down the left"],
        ],
      ),
      list(
        "tabs",
        "Tabs",
        [
          text("label", "Tab label", { required: true, max: 80 }),
          text("title", "Panel title", { max: 200 }),
          textarea("text", "Panel text", { max: 800 }),
          list("chips", "Question chips", [text("text", "Question", { required: true, max: 200 })], { max: 6 }),
          text("note_label", "Note: bold label", { max: 80, help: "For example How Rapid helps." }),
          textarea("note_text", "Note: text", { max: 600 }),
          text("callout", "Callout", { max: 300 }),
          list(
            "cards",
            "Cards",
            [text("title", "Card title", { required: true, max: 120 }), text("text", "First line", { max: 160 }), text("hint", "Second line", { max: 160 }), url("href", "Link (optional)")],
            { max: 12 },
          ),
          text("cta_label", "Button label", { max: 60 }),
          url("cta_href", "Button link", { help: "Empty opens the enquiry form." }),
        ],
        { max: 8 },
      ),
      text("footer_text", "Line under the panel", { max: 300 }),
      text("footer_cta_label", "Button under the panel", { max: 60 }),
      url("footer_cta_href", "Button link"),
    ],
    defaults: { tab_layout: "top" },
  },

  info_panel: {
    label: "Info and photo panel",
    description: "Text with label and value lines (address, phone, hours), a button, and a placeholder panel (photo or map) beside it.",
    rail: false,
    variants: DEFAULT_VARIANT,
    fields: [
      text("eyebrow", "Small label above the heading", { max: 120 }),
      text("heading", "Heading", { max: 300 }),
      list("lines", "Lines", [text("label", "Label", { max: 60 }), textarea("text", "Text", { max: 400 }), url("href", "Link (optional)")], { max: 8 }),
      text("cta_label", "Button label", { max: 60 }),
      url("cta_href", "Button link"),
      text("panel_label", "Panel: small label", { max: 80, help: "For example OFFICE PHOTO / MAP. The map shows when there is no photo." }),
      text("panel_title", "Panel: title", { max: 200 }),
      text("panel_note", "Panel: note", { max: 200 }),
      url("map_url", "Google Maps embed address (optional)", { help: "Paste the src address of the Google Maps embed (starts with https://www.google.com/maps/embed). Leave empty to show the Rapid office map." }),
      image("image", "Photo (optional)"),
      text("image_alt", "Photo description", { max: 200 }),
    ],
  },
};

// ── Templates ─────────────────────────────────────────────────────────────

const LINKED = ["linked_schemes", "linked_services", "linked_cases", "linked_articles"];

// The generic blocks of the Managed pages, also usable on hubs and rail pages.
const GENERIC = [
  "data_table",
  "feature_cards",
  "team_cards",
  "case_cards",
  "faq_accordion",
  "banner",
  "directory",
  "tabs_panel",
  "info_panel",
];

const RAIL_ALLOWED = [
  "masthead",
  "rich_text",
  "steps",
  "card_grid",
  ...LINKED,
  "people",
  "faq",
  "video",
  "comparison",
  "callout",
  "documents_checklist",
  "qa_list",
  "case_tiles",
  "quote_cards",
  "roadmap_timeline",
  "timeline_steps",
  "logo_strip",
  "reviews_carousel",
  "cta_panel",
  "closing_panel",
  "enquiry_form",
  ...GENERIC,
];

const TEMPLATE_DEFS = {
  hub: {
    label: "Hub",
    description: "A full-width landing page that leads visitors on to other pages. No side enquiry panel.",
    layout: "full",
    allowed: [
      "masthead",
      "card_grid",
      "stage_chooser",
      "stage_section",
      ...LINKED,
      "faq",
      "faq_hub",
      "rich_text",
      "callout",
      "cta_panel",
      "enquiry_form",
      "video",
      "comparison",
      "people",
      "logo_strip",
      "mistakes_claim",
      "timeline_steps",
      "scheme_search",
      "reviews_carousel",
      "closing_panel",
      ...GENERIC,
    ],
  },
  situation: {
    label: "Situation",
    description: "A page for a situation a visitor is in, with the enquiry panel beside the content.",
    layout: "rail",
    allowed: RAIL_ALLOWED,
  },
  campaign: {
    label: "Campaign",
    description: "A focused page for one message or campaign, with the enquiry panel beside the content.",
    layout: "rail",
    allowed: RAIL_ALLOWED,
  },
  resource: {
    label: "Resource",
    description: "A practical resource page, with the enquiry panel beside the content.",
    layout: "rail",
    allowed: RAIL_ALLOWED,
  },
  service: {
    label: "Service",
    description: "A service page built from blocks, with the enquiry panel beside the content.",
    layout: "rail",
    allowed: RAIL_ALLOWED,
  },
  scheme: {
    label: "Scheme",
    description: "A scheme page built from blocks, with the enquiry panel beside the content.",
    layout: "rail",
    allowed: RAIL_ALLOWED,
  },
  profile: {
    label: "Profile",
    description: "A profile page for a person or team, with the enquiry panel beside the content.",
    layout: "rail",
    allowed: [
      "masthead",
      "rich_text",
      "steps",
      ...LINKED,
      "faq",
      "documents_checklist",
      "callout",
      "video",
      "cta_panel",
      "enquiry_form",
    ],
  },
};

// Managed: the website's own pages. The layout stays in the website's views;
// only the text lives here. Every block may be used, in any order, and no block
// has to come first.
TEMPLATE_DEFS[MANAGED_TEMPLATE] = {
  label: "Managed",
  description:
    "A page the website draws itself (About, Contact, Resources, Scheme directory, Case archive, How we work, Home). Only its text is edited here.",
  layout: "full",
  allowed: Object.keys(BLOCK_DEFS),
  required: [],
  first: null,
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATE_DEFS);
export const BLOCK_KEYS = Object.keys(BLOCK_DEFS);

// ── Defaults ──────────────────────────────────────────────────────────────

const emptyValue = (field) => {
  switch (field.kind) {
    case "boolean":
      return false;
    case "number":
      return null;
    case "list":
      return [];
    case "record":
      return field.multiple ? [] : null;
    case "select":
      return field.options?.[0]?.value ?? "";
    default:
      return "";
  }
};

const defaultsFor = (fields, overrides = {}) =>
  Object.fromEntries(
    fields.map((field) => [field.key, field.key in overrides ? overrides[field.key] : emptyValue(field)]),
  );

const BLOCKS = Object.fromEntries(
  Object.entries(BLOCK_DEFS).map(([type, def]) => [
    type,
    { ...def, defaults: defaultsFor(def.fields, def.defaults) },
  ]),
);

const TEMPLATES = Object.fromEntries(
  Object.entries(TEMPLATE_DEFS).map(([key, def]) => [
    key,
    { required: ["masthead"], first: "masthead", ...def },
  ]),
);

// What GET .../registry returns. A fresh deep copy each call, so callers can
// never change the definitions.
export const getRegistry = () => JSON.parse(JSON.stringify({ templates: TEMPLATES, blocks: BLOCKS }));

export const getTemplate = (key) => TEMPLATES[key] ?? null;
export const getBlock = (type) => BLOCKS[type] ?? null;

// ── HTML sanitising ───────────────────────────────────────────────────────
// No HTML sanitiser exists elsewhere on the server (article HTML is stored as
// written and cleaned in the editor), so this is a conservative strip of
// anything that can run code. Normal formatting (headings, lists, links,
// tables, images, emphasis) is left alone.

const BLOCK_TAGS = "script|style|iframe|object|embed|template|noscript|form|textarea|select|svg|math";
const LOOSE_TAGS = `${BLOCK_TAGS}|link|meta|base|input|button|applet|frame|frameset`;
const PAIRED = new RegExp(`<\\s*(${BLOCK_TAGS})\\b[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, "gi");
const LOOSE = new RegExp(`<\\s*\\/?\\s*(?:${LOOSE_TAGS})\\b[^>]*>`, "gi");
const SLASH_BEFORE_EVENT = /(<[a-z][^\s>/]*)\/(?=on[a-z]+\s*=)/gi;
const EVENT_ATTRIBUTES = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SRCDOC = /\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SCRIPT_URL =
  /(\s(?:href|src|xlink:href|action|formaction|poster)\s*=\s*)(?:"\s*(?:javascript|vbscript|data)\s*:[^"]*"|'\s*(?:javascript|vbscript|data)\s*:[^']*'|(?:javascript|vbscript|data)\s*:[^\s>]*)/gi;

export const sanitiseHtml = (value) => {
  let out = String(value ?? "");
  for (let pass = 0; pass < 3; pass += 1) {
    const before = out;
    out = out
      .replace(PAIRED, "")
      .replace(LOOSE, "")
      .replace(SLASH_BEFORE_EVENT, "$1 ")
      .replace(EVENT_ATTRIBUTES, "")
      .replace(SRCDOC, "")
      .replace(SCRIPT_URL, '$1"#"');
    if (out === before) break;
  }
  return out.trim();
};

// ── Normalising values ────────────────────────────────────────────────────

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const CONTROL_AND_NEWLINES = /[\u0000-\u001f\u007f]+/g;

const makeSlug = (value) => slugify(String(value ?? ""), { lower: true, strict: true });

const uniqueSlug = (base, taken) => {
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
  taken.add(slug);
  return slug;
};

const isBlank = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return !value.id;
  return false;
};

const SAFE_URL = /^(?:\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;

const truthy = (value) => value === true || value === "true" || value === 1 || value === "1";

// Cleans one field value. `report(message)` records a problem; the returned
// value is always safe to store.
const normaliseValue = (field, input, report, ctx) => {
  switch (field.kind) {
    case "text": {
      const value = String(input ?? "").replace(CONTROL_AND_NEWLINES, " ").trim();
      if (value.length > field.max) report(`${field.label} must be ${field.max} characters or fewer`);
      return value.slice(0, field.max);
    }
    case "textarea": {
      const value = String(input ?? "").replace(/\r\n?/g, "\n").replace(CONTROL, "").trim();
      if (value.length > field.max) report(`${field.label} must be ${field.max} characters or fewer`);
      return value.slice(0, field.max);
    }
    case "html": {
      const value = sanitiseHtml(String(input ?? "").replace(CONTROL, ""));
      if (value.length > field.max) report(`${field.label} is too long (${field.max} characters at most)`);
      return value.slice(0, field.max);
    }
    case "url": {
      const value = String(input ?? "").trim();
      if (!value) return "";
      if (value.length > field.max || /\s/.test(value) || !SAFE_URL.test(value)) {
        report(`${field.label} must be a page on this site (starting with /), a # link, or a full web address`);
        return "";
      }
      return value;
    }
    case "image": {
      const value = String(input ?? "").trim();
      if (!value) return "";
      if (value.length > field.max || /^(?:javascript|vbscript|data):/i.test(value) || /[\s<>"]/.test(value)) {
        report(`${field.label} is not a valid image location`);
        return "";
      }
      return value;
    }
    case "boolean":
      return truthy(input);
    case "number": {
      if (input === "" || input === null || input === undefined) return null;
      const value = Number(input);
      if (!Number.isFinite(value)) {
        report(`${field.label} must be a number`);
        return null;
      }
      if (field.min !== undefined && value < field.min) report(`${field.label} must be at least ${field.min}`);
      if (field.max !== undefined && value > field.max) report(`${field.label} must be at most ${field.max}`);
      return value;
    }
    case "select": {
      const fallback = field.options[0]?.value ?? "";
      const value = input === undefined || input === null || input === "" ? null : String(input);
      if (value === null) return ctx.defaultFor(field) ?? fallback;
      if (!field.options.some((option) => option.value === value)) {
        report(`${field.label} must be one of: ${field.options.map((option) => option.label).join(", ")}`);
        return ctx.defaultFor(field) ?? fallback;
      }
      return value;
    }
    case "record": {
      const refs = (field.multiple ? (Array.isArray(input) ? input : input ? [input] : []) : [input])
        .filter((item) => item && typeof item === "object" && !isBlank(item.id));
      const seen = new Set();
      const out = [];
      for (const item of refs) {
        const id = String(item.id).trim();
        if (!isUuid(id)) {
          report(`${field.label}: "${id.slice(0, 40)}" is not a valid record`);
          continue;
        }
        if (seen.has(id)) continue;
        seen.add(id);
        const ref = { id };
        const slug = String(item.slug ?? "").trim().slice(0, 300);
        const title = String(item.title ?? "").replace(CONTROL_AND_NEWLINES, " ").trim().slice(0, 300);
        if (slug) ref.slug = slug;
        if (title) ref.title = title;
        out.push(ref);
      }
      if (out.length > (field.max ?? 24)) report(`${field.label}: choose at most ${field.max ?? 24}`);
      const kept = out.slice(0, field.max ?? 24);
      return field.multiple ? kept : (kept[0] ?? null);
    }
    case "list": {
      const rows = Array.isArray(input) ? input : [];
      if (!Array.isArray(input) && input !== undefined && input !== null) report(`${field.label} must be a list`);
      const items = [];
      const slugTaken = new Map();
      for (const row of rows) {
        if (!row || typeof row !== "object" || Array.isArray(row)) continue;
        const item = {};
        const nested = [];
        for (const sub of field.item_fields) {
          const subReport = (message) => nested.push(message);
          item[sub.key] = normaliseValue(sub, row[sub.key], subReport, ctx);
        }
        // A row where nothing was filled in is a blank row: drop it.
        const filled = field.item_fields.some((sub) => !isBlank(item[sub.key]) && sub.kind !== "boolean" && sub.kind !== "select");
        if (!filled) continue;
        nested.forEach((message) => report(`${field.label} ${items.length + 1}: ${message}`));
        for (const sub of field.item_fields) {
          if (sub.slug_from) {
            const taken = slugTaken.get(sub.key) ?? new Set();
            slugTaken.set(sub.key, taken);
            const base = makeSlug(item[sub.key]) || makeSlug(item[sub.slug_from]) || `item-${items.length + 1}`;
            item[sub.key] = uniqueSlug(base, taken);
          }
        }
        if (ctx.strict) {
          for (const sub of field.item_fields) {
            if (sub.required && isBlank(item[sub.key])) {
              report(`${field.label} ${items.length + 1}: ${sub.label} is required`);
            }
          }
        }
        items.push(item);
      }
      if (items.length > field.max) report(`${field.label}: at most ${field.max} items`);
      return items.slice(0, field.max);
    }
    default:
      return input ?? "";
  }
};

// ── Sections ──────────────────────────────────────────────────────────────

export const newSectionId = () => randomUUID();

// { type, variant, label, data } -> a stored section object with defaults.
export const makeSection = (type, overrides = {}) => {
  const block = BLOCKS[type];
  if (!block) return null;
  return {
    id: newSectionId(),
    type,
    variant: block.variants[0].key,
    visible: true,
    label: "",
    anchor: "",
    data: { ...block.defaults, ...(overrides.data ?? {}) },
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== "data")),
  };
};

// A new page starts with just its masthead (zero sections is allowed only for
// a draft, but a masthead gives the editor something to build on).
export const starterSections = (title = "") => [
  makeSection("masthead", { data: { heading: String(title ?? "").slice(0, 200) } }),
];

// Same sections with new ids (for a translation copy). Anchors stay the same.
export const cloneSections = (sections) =>
  JSON.parse(JSON.stringify(Array.isArray(sections) ? sections : [])).map((section) => ({
    ...section,
    id: newSectionId(),
  }));

// Only the sections a visitor should see (hidden ones stay in the draft only).
export const visibleSections = (sections) =>
  (Array.isArray(sections) ? sections : []).filter((section) => section && section.visible !== false);

// Every linked-record reference in the sections, as
// [{ record_type, ref }] where `ref` is the stored object (so a caller can
// refresh its slug / title in place).
export const collectRecordRefs = (sections) => {
  const found = [];
  const walk = (fields, data) => {
    if (!data || typeof data !== "object") return;
    for (const field of fields) {
      const value = data[field.key];
      if (field.kind === "record") {
        (Array.isArray(value) ? value : value ? [value] : []).forEach((ref) =>
          found.push({ record_type: field.record_type, ref }),
        );
      } else if (field.kind === "list" && Array.isArray(value)) {
        value.forEach((row) => walk(field.item_fields, row));
      }
    }
  };
  for (const section of Array.isArray(sections) ? sections : []) {
    const block = BLOCKS[section?.type];
    if (block) walk(block.fields, section.data);
  }
  return found;
};

const anchorBase = (section, block) =>
  makeSlug(section.label).slice(0, 60) ||
  makeSlug(section.data?.heading).slice(0, 60) ||
  makeSlug(block.label) ||
  section.type.replace(/_/g, "-");

// Checks and cleans a page's sections.
//   options.template  template key (required)
//   options.strict    false (default): a draft save - structure is checked;
//                     true: publish / submit - the page must also be complete
//                     (at least a visible masthead, required fields filled).
// Returns { sections, errors } where errors is
// [{ index, section_id, type, label, field?, message }]. When errors is empty
// the sections are ready to store.
export const normaliseSections = (input, { template, strict = false } = {}) => {
  const errors = [];
  const templateDef = TEMPLATES[template];
  const fail = (index, section, message, field) =>
    errors.push({
      index,
      section_id: section?.id ?? null,
      type: section?.type ?? null,
      label: section?.label || BLOCKS[section?.type]?.label || null,
      ...(field ? { field } : {}),
      message,
    });

  if (!templateDef) {
    fail(-1, null, `Unknown page template "${template}"`);
    return { sections: [], errors };
  }
  if (input === undefined || input === null) input = [];
  if (!Array.isArray(input)) {
    fail(-1, null, "Sections must be a list");
    return { sections: [], errors };
  }
  if (input.length > MAX_SECTIONS) {
    fail(-1, null, `A page can have at most ${MAX_SECTIONS} sections`);
    return { sections: [], errors };
  }

  const usedIds = new Set();
  const sections = [];

  input.forEach((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      fail(index, null, "Section must be an object");
      return;
    }
    const type = String(raw.type ?? "").trim();
    const block = BLOCKS[type];
    if (!block) {
      fail(index, { type }, `Unknown section type "${type.slice(0, 60)}"`);
      return;
    }
    if (!templateDef.allowed.includes(type)) {
      fail(index, { type }, `${block.label} cannot be used on a ${templateDef.label} page`);
      return;
    }

    const variantInput = String(raw.variant ?? "").trim();
    let variant = block.variants[0].key;
    if (variantInput) {
      if (block.variants.some((entry) => entry.key === variantInput)) variant = variantInput;
      else fail(index, { type }, `Unknown variant "${variantInput.slice(0, 40)}" for ${block.label}`);
    }

    let id = String(raw.id ?? "").trim().toLowerCase();
    if (!isUuid(id) || usedIds.has(id)) id = newSectionId();
    usedIds.add(id);

    const label = String(raw.label ?? "").replace(CONTROL_AND_NEWLINES, " ").trim();
    if (label.length > LABEL_MAX) fail(index, { id, type, label }, `Label must be ${LABEL_MAX} characters or fewer`, "label");

    const section = {
      id,
      type,
      variant,
      visible: !(raw.visible === false || raw.visible === "false" || raw.visible === 0 || raw.visible === "0"),
      label: label.slice(0, LABEL_MAX),
      anchor: String(raw.anchor ?? "").trim() ? makeSlug(raw.anchor).slice(0, 60) : "",
      data: {},
    };

    const dataInput =
      raw.data && typeof raw.data === "object" && !Array.isArray(raw.data) ? raw.data : {};
    if (raw.data !== undefined && raw.data !== null && dataInput !== raw.data) {
      fail(index, section, "Section data must be an object", "data");
    }

    const ctx = { strict, defaultFor: (field) => block.defaults[field.key] };
    for (const field of block.fields) {
      const present = field.key in dataInput;
      const value = present ? dataInput[field.key] : block.defaults[field.key];
      section.data[field.key] = normaliseValue(
        field,
        value,
        (message) => fail(index, section, message, field.key),
        ctx,
      );
      if (strict && section.visible && field.required && isBlank(section.data[field.key])) {
        fail(index, section, `${field.label} is required`, field.key);
      }
    }
    sections.push(section);
  });

  // Anchors: unique inside the page (a clash or a blank one gets -2, -3 ...).
  const anchors = new Set();
  sections
    .filter((section) => section.anchor)
    .forEach((section) => {
      if (anchors.has(section.anchor)) section.anchor = "";
      else anchors.add(section.anchor);
    });
  sections
    .filter((section) => !section.anchor)
    .forEach((section) => {
      section.anchor = uniqueSlug(anchorBase(section, BLOCKS[section.type]), anchors);
    });

  // Structure: masthead first and only once; complete when strict.
  if (sections.length && templateDef.first) {
    const mastheads = sections.filter((section) => section.type === templateDef.first);
    if (sections[0].type !== templateDef.first) {
      fail(0, sections[0], `The first section must be the ${BLOCKS[templateDef.first].label}`);
    }
    if (mastheads.length > 1) {
      fail(sections.indexOf(mastheads[1]), mastheads[1], `A page can have only one ${BLOCKS[templateDef.first].label}`);
    }
  }
  if (strict && templateDef.first) {
    if (!sections.length) {
      fail(-1, null, `Add a ${BLOCKS[templateDef.first].label} before sending the page for review or publishing it`);
    } else if (sections[0].type === templateDef.first && !sections[0].visible) {
      fail(0, sections[0], `The ${BLOCKS[templateDef.first].label} must be visible`);
    }
  }

  return { sections, errors };
};

// "Section 3 (Questions and answers): Question 2: ... is required" lines.
export const describeErrors = (errors) =>
  errors.map((error) => {
    const where = error.index >= 0 ? `Section ${error.index + 1}${error.label ? ` (${error.label})` : ""}: ` : "";
    return `${where}${error.message}`;
  });
