// Central navigation: the seven primary destinations of the header and the
// footer columns. The built-in default below is used until the admin panel
// saves a "navigation" site setting (GET /site-settings/navigation); the saved
// value is merged OVER the default (see mergeNavigation), so a missing or
// partial setting can never leave the header empty.
//
// Saved value (hrefs are locale-less paths; the website adds the language):
//   { primary: [{ key, label, label_hi?, href, visible, order?, children?: [{ label, label_hi?, href }] }],
//     footer:  [{ heading, heading_hi?, links: [{ label, label_hi?, href, visible }] }] }
// Primary keys are the fixed set below (+ optional "custom-*" link items).

export const PRIMARY_KEYS = ["approvals", "subsidies", "your-project", "industries", "work", "resources", "about"];

// The stages of Your Project: anchor key, label and short neutral line.
export const PROJECT_STAGES = [
  { key: "buying-land", label: "Buying land", text: "Check the land and its use before you commit to the plot." },
  { key: "setting-up", label: "Setting up", text: "Approvals, registrations and subsidies for a new unit." },
  { key: "running", label: "Running", text: "Renewals, compliance and support for a unit already working." },
  { key: "expanding", label: "Expanding", text: "Approvals and support when you add capacity or land." },
  { key: "file-stuck", label: "A file stuck at any stage", text: "Talk to Rapid about where it is waiting and the next step." },
];

// The hub pages the primary items lead to (site pages built in the page builder).
export const APPROVALS_HUB_HREF = "/approvals";
export const SUBSIDIES_HUB_HREF = "/subsidies";

// Other business support (Approvals menu): destinations that are not a service category.
export const FINANCE_AND_INSURANCE_HREF = "/finance-and-insurance";
export const ALL_SERVICES_HREF = "/services";

// `extra`: { disabled: true } = an item whose page is not built yet (rendered as
// plain, non-actionable text, never a dead link); { action: "enquiry" } = opens
// the enquiry drawer instead of navigating.
const link = (id, labelKey, defaultLabel, href, extra = {}) => ({ id, labelKey, defaultLabel, href, visible: true, ...extra });
const col = (id, headingKey, defaultHeading, links) => ({ id, headingKey, defaultHeading, links });

export function defaultNavigation() {
  return {
    primary: [
      { key: "approvals", labelKey: "wb.nav.approvals", defaultLabel: "Approvals", href: "/approvals" },
      { key: "subsidies", labelKey: "wb.nav.subsidies", defaultLabel: "Subsidies", href: "/subsidies" },
      {
        key: "your-project",
        labelKey: "wb.nav.yourProject",
        defaultLabel: "Your Project",
        href: "/your-project",
        children: PROJECT_STAGES.map((stage) => ({
          key: stage.key,
          labelKey: `wb.stages.${stage.key}`,
          defaultLabel: stage.label,
          textKey: `wb.stageText.${stage.key}`,
          defaultText: stage.text,
          href: `/your-project#${stage.key}`,
        })),
      },
      { key: "industries", labelKey: "wb.nav.industries", defaultLabel: "Industries", href: "/industries" },
      { key: "work", labelKey: "wb.nav.work", defaultLabel: "Work", href: "/case-studies" },
      { key: "resources", labelKey: "wb.nav.resources", defaultLabel: "Resources", href: "/resources" },
      { key: "about", labelKey: "wb.nav.about", defaultLabel: "About", href: "/about" },
    ].map((item, index) => ({ visible: true, order: index, ...item })),
    // Eight columns (Figma batch 1, section A). Every href is a route that
    // exists in the build; items whose page is not built yet are `disabled`.
    footer: [
      col("approvals", "wb.nav.approvals", "Approvals", [
        link("approval-overview", "hdr.footer.approvalOverview", "Approval overview", "/approvals"),
        link("clu", "hdr.footer.clu", "CLU & land permissions", "/services/change-in-land-use-clu"),
        link("building-plan", "hdr.footer.buildingPlan", "Building plan approval", "/services/building-plans-approval-from-dtp-and-stp-haryana"),
        link("cte-cto", "hdr.footer.cteCto", "CTE & CTO", "/services/consent-to-establish-cte-pollution-noc"),
        link("fire-noc", "hdr.footer.fireNoc", "Fire NOC", "/services/fire-department-noc"),
      ]),
      col("subsidies", "hdr.footer.cols.subsidies", "Subsidies & Incentives", [
        link("subsidy-advisory", "hdr.footer.subsidyAdvisory", "Subsidy advisory", "/services/msmes-subsidy-consultant"),
        link("scheme-directory", "hdr.footer.schemeDirectory", "Scheme directory", "/schemes"),
        link("schemes-by-industry", "hdr.footer.schemesByIndustry", "Schemes by industry", "/schemes", { disabled: true }),
        link("subsidy-check", "hdr.footer.subsidyCheck", "Request a subsidy check", "/contact", { action: "enquiry" }),
      ]),
      col("your-project", "wb.nav.yourProject", "Your Project", [
        link("buying-land", "hdr.footer.buyingLand", "Buying industrial land", "/your-project#buying-land"),
        link("setting-up", "hdr.footer.settingUp", "Setting up a new unit", "/your-project#setting-up"),
        link("expanding", "hdr.footer.expanding", "Machinery or expansion", "/your-project#expanding"),
        link("running", "hdr.footer.running", "Unit already running", "/your-project#running"),
        link("file-stuck", "hdr.footer.fileStuck", "Approval or claim stuck", "/your-project#file-stuck"),
        link("all-situations", "hdr.footer.allSituations", "Explore all situations", "/your-project"),
      ]),
      col("industries", "wb.nav.industries", "Industries", [
        link("food", "hdr.footer.food", "Food & agro processing", "/industries/food-and-agro-processing"),
        link("engineering", "hdr.footer.engineering", "Engineering & materials", "/industries/engineering-and-materials-manufacturing"),
        link("recycling", "hdr.footer.recycling", "Recycling & biofuel", "/industries/recycling-and-biofuel"),
        link("commercial", "hdr.footer.commercial", "Commercial & logistics", "/industries/commercial-and-logistics-facilities"),
        link("all-industries", "hdr.footer.allIndustries", "View all industries", "/industries"),
      ]),
      col("work", "wb.nav.work", "Work", [
        link("case-studies", "hdr.footer.caseStudies", "Case studies", "/case-studies"),
        link("client-reviews", "hdr.footer.clientReviews", "Client reviews", "/case-studies", { disabled: true }),
      ]),
      col("resources", "wb.nav.resources", "Resources", [
        link("articles", "hdr.footer.articles", "Articles", "/articles"),
        link("guides", "hdr.footer.guides", "Guides", "/guides"),
        link("reports", "hdr.footer.reports", "Reports & downloads", "/resources", { disabled: true }),
        link("faqs", "wb.footer.faqs", "FAQs", "/faqs"),
        link("resources-overview", "hdr.footer.resourcesOverview", "Resources overview", "/resources"),
        link("sessions", "header.liveSessions", "Live sessions", "/sessions"),
      ]),
      col("about", "hdr.footer.cols.about", "About Rapid", [
        link("story", "hdr.footer.story", "Story, advantage & team", "/about"),
        link("how-we-work", "hdr.footer.howWeWork", "How we work", "/how-we-work"),
        link("advisers", "hdr.footer.advisers", "For CAs & bankers", "/advisers"),
        link("careers", "hdr.footer.careers", "Careers", "/careers"),
        link("contact", "header.contactPage", "Contact us", "/contact"),
      ]),
      col("other-support", "wb.menu.otherSupport", "Other business support", [
        link("finance-dpr", "hdr.footer.financeDpr", "Finance & DPR", "/services/finance-and-other-services"),
        link("insurance", "hdr.footer.insurance", "Insurance & claims", "/services/industrial-insurance-consultant"),
        link("registrations", "hdr.footer.registrations", "Registrations & certifications", "/services/trade-license-consultant"),
        link("all-services", "hdr.footer.allServices", "View all services", "/services"),
      ]),
    ],
  };
}

// ── helpers ──
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : "");
const sameText = (a, b) => a.toLowerCase() === b.toLowerCase();

// Accepted: a site path ("/x", "/x#y"), "#anchor", http(s), mailto, tel.
const validHref = (value) => {
  const href = text(value);
  if (!href) return "";
  if (/^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(href)) return href;
  return "";
};

export const isExternalHref = (href) => /^(https?:\/\/|mailto:|tel:|\/\/)/i.test(href ?? "");

// "/services/x" -> "/en/services/x"; already-prefixed, external and "#hash" values pass through.
export function localizeHref(href, locale) {
  const value = text(href);
  if (!value) return `/${locale}`;
  if (isExternalHref(value) || value.startsWith("#")) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  if (/^\/(en|hi)(?=\/|$|[?#])/.test(path)) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// The stage key of a "…/your-project#stage" href ("" when none).
export const stageKeyOf = (href) => (text(href).split("#")[1] ?? "").trim();

// Label of a navigation item in `locale`. `translate(key, fallback)` is the
// website's translator with English fallback (useTx in the browser).
//   English: the saved label, else the translated default.
//   Hindi: the saved Hindi label, else the translated default (custom items: their label).
export function navigationLabel(item, locale, translate) {
  const fromKey = () => (item.labelKey ? translate(item.labelKey, item.defaultLabel ?? "") : (item.defaultLabel ?? ""));
  if (locale === "hi") return item.label_hi || (item.labelKey ? fromKey() : item.label || fromKey());
  return item.label || fromKey();
}

export function footerHeading(column, locale, translate) {
  const fromKey = () => (column.headingKey ? translate(column.headingKey, column.defaultHeading ?? "") : (column.defaultHeading ?? ""));
  if (locale === "hi") return column.heading_hi || (column.headingKey ? fromKey() : column.heading || fromKey());
  return column.heading || fromKey();
}

function mergeChildren(defaultChildren, saved) {
  if (!Array.isArray(saved)) return defaultChildren;
  const children = saved
    .filter(isObject)
    .map((child) => {
      const label = text(child.label);
      const href = validHref(child.href);
      if (!label || !href) return null;
      const key = stageKeyOf(href);
      const stage = PROJECT_STAGES.find((item) => item.key === key);
      return {
        key: key || undefined,
        label,
        label_hi: text(child.label_hi),
        href,
        // a known stage keeps its short description
        ...(stage ? { textKey: `wb.stageText.${stage.key}`, defaultText: stage.text } : {}),
      };
    })
    .filter(Boolean);
  // An empty list means "no override".
  return children.length ? children : defaultChildren;
}

function mergePrimary(defaults, saved) {
  const byKey = new Map(defaults.map((item) => [item.key, { ...item }]));
  const extra = [];

  if (Array.isArray(saved)) {
    saved.filter(isObject).forEach((entry, index) => {
      const key = text(entry.key);
      const order = Number.isFinite(Number(entry.order)) && entry.order !== null && entry.order !== "" ? Number(entry.order) : index;
      const visible = entry.visible === false || entry.visible === "false" || entry.visible === 0 ? false : true;

      if (byKey.has(key)) {
        const item = byKey.get(key);
        const label = text(entry.label);
        if (label && !sameText(label, item.defaultLabel)) item.label = label;
        const labelHi = text(entry.label_hi);
        if (labelHi) item.label_hi = labelHi;
        const href = validHref(entry.href);
        if (href) item.href = href;
        item.visible = visible;
        item.order = order;
        item.children = mergeChildren(item.children, entry.children);
        return;
      }

      // Unknown primary keys are ignored unless they are custom links.
      if (!key.startsWith("custom-")) return;
      const label = text(entry.label);
      const href = validHref(entry.href);
      if (!label || !href) return;
      extra.push({
        key,
        custom: true,
        label,
        label_hi: text(entry.label_hi),
        href,
        visible,
        order,
        children: mergeChildren(undefined, entry.children),
      });
    });
  }

  // Built-in destinations the saved setting does not mention follow the listed ones, in default order.
  if (Array.isArray(saved) && saved.length) {
    const listed = new Set(saved.filter(isObject).map((entry) => text(entry.key)));
    byKey.forEach((item) => {
      if (!listed.has(item.key)) item.order = saved.length + item.order;
    });
  }

  const items = [...byKey.values(), ...extra];
  // stable: equal orders keep the default sequence
  const sequence = new Map(items.map((item, index) => [item.key, index]));
  items.sort((a, b) => a.order - b.order || sequence.get(a.key) - sequence.get(b.key));
  // Never leave the header without a menu.
  return items.some((item) => item.visible) ? items : defaults;
}

function mergeFooter(defaults, saved) {
  if (!Array.isArray(saved)) return defaults;
  const columns = saved
    .filter(isObject)
    .map((column, index) => {
      const heading = text(column.heading);
      const links = (Array.isArray(column.links) ? column.links : [])
        .filter(isObject)
        .map((entry, linkIndex) => {
          const label = text(entry.label);
          const href = validHref(entry.href);
          if (!label || !href) return null;
          const visible = !(entry.visible === false || entry.visible === "false" || entry.visible === 0);
          return { id: `${index}-${linkIndex}`, label, label_hi: text(entry.label_hi), href, visible };
        })
        .filter(Boolean);
      if (!heading || !links.length) return null;
      return { id: `saved-${index}`, heading, heading_hi: text(column.heading_hi), links };
    })
    .filter(Boolean);
  return columns.length ? columns : defaults;
}

// Default navigation with the saved setting (or null/{}/anything invalid) applied over it.
export function mergeNavigation(saved) {
  const base = defaultNavigation();
  const value = isObject(saved) ? saved : {};
  return {
    primary: mergePrimary(base.primary, value.primary),
    footer: mergeFooter(base.footer, value.footer),
  };
}
