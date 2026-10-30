// seeders/20261030100001-reviews-section-role.js
// 30 October 2026: the "In our clients' words." section of a service page gets its own
// layout, role "reviews" (rating box + review cards). Until now it was a "cards" section
// whose reviewer details were written into each card's text, for example
//   <p>5 ★★★★★ · TRUSTED BY GROWING BUSINESSES</p>
//   <p>Client name · Business name · Hisar, Haryana</p>
//   <p>SERVICES TAKEN: Change of Land Use (CLU)</p>
// Those lines become fields (rating, name, business, location, services). The rating
// box numbers are left empty: the design's X.X / XX / XXXXX are placeholders, and each
// service's own figures are filled in from the admin panel.
//
// Only sections with key "client-experiences" and role "cards" are changed; running it
// again changes nothing.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261030100001-reviews-section-role

const KEY = "client-experiences";
const TRUST = "TRUSTED BY GROWING BUSINESSES";

// The stored HTML writes the separator as &middot; (and & as &amp;).
const decode = (text) =>
  text
    .replace(/&middot;|&#183;|&#xb7;/gi, "·")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");

const paragraphs = (html = "") =>
  [...String(html).matchAll(/<p>([\s\S]*?)<\/p>/gi)].map((match) => decode(match[1].replace(/<[^>]+>/g, "")).trim());

const isPlaceholder = (text) => /^X+(\.X+)?$/i.test(text.trim());

function toReviews(section) {
  const [intro, ...introRest] = paragraphs(section.intro_html);
  const items = (section.items ?? []).map((item) => {
    const lines = paragraphs(item.html);
    const ratingLine = lines.find((line) => /★/.test(line)) ?? "";
    const servicesLine = lines.find((line) => /^services taken\s*:/i.test(line)) ?? "";
    const personLine = lines.find((line) => line !== ratingLine && line !== servicesLine) ?? "";
    const [name = "", business = "", ...place] = personLine.split(" · ").map((part) => part.trim());
    const out = { key: item.key, title: item.title, html: "" };
    const rating = ratingLine.match(/^\s*(\d(?:\.\d)?)/)?.[1];
    if (rating) out.rating = rating;
    if (name) out.name = name;
    if (business) out.business = business;
    if (place.length) out.location = place.join(" · ");
    const services = servicesLine.replace(/^services taken\s*:\s*/i, "").trim();
    if (services) out.services = services;
    return out;
  });
  // "Overall rating: 4.8 / 5 · 120 client reviews · Source: Google" (kept only when real numbers).
  const ratingLine = introRest.find((line) => /overall rating/i.test(line)) ?? "";
  const value = ratingLine.match(/overall rating:\s*([^/·]+)/i)?.[1]?.trim() ?? "";
  const count = ratingLine.match(/·\s*([^·]+?)\s+client reviews/i)?.[1]?.trim() ?? "";
  const source = ratingLine.match(/source:\s*(.+)$/i)?.[1]?.trim() ?? "";
  const next = { ...section, role: "reviews", intro_html: intro ? `<p>${intro}</p>` : "", items, trust_label: TRUST };
  if (value && !isPlaceholder(value)) next.rating_value = value;
  if (count && !isPlaceholder(count)) next.rating_count = count;
  if (source && !isPlaceholder(source)) next.rating_source = source;
  // "View all reviews" had no address; there is no reviews page yet.
  if (paragraphs(section.outro_html).join("") === "View all reviews") next.outro_html = "";
  return next;
}

function toCards(section) {
  const { rating_value, rating_count, rating_source, trust_label, ...rest } = section;
  const ratingText = `Overall rating: ${rating_value || "X.X"} / 5 · ${rating_count || "XX"} client reviews · Source: ${rating_source || "XXXXX"}`;
  return {
    ...rest,
    role: "cards",
    intro_html: `${section.intro_html || ""}<p>${ratingText}</p>`,
    items: (section.items ?? []).map((item) => ({
      key: item.key,
      title: item.title,
      html: [
        `<p>${item.rating || 5} ★★★★★ · ${trust_label || TRUST}</p>`,
        `<p>${[item.name, item.business, item.location].filter(Boolean).join(" · ")}</p>`,
        item.services ? `<p>SERVICES TAKEN: ${item.services}</p>` : "",
      ].join(""),
    })),
    outro_html: section.outro_html || "<p>View all reviews</p>",
  };
}

async function apply(queryInterface, fromRole, convert) {
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    const rows = await sequelize.query(
      `SELECT st.id, st.locale, s.slug, st.sections
         FROM service_translations st JOIN services s ON s.id = st.service_id
        WHERE st.sections @> :match::jsonb`,
      { replacements: { match: JSON.stringify([{ key: KEY, role: fromRole }]) }, transaction, type: "SELECT" },
    );
    for (const row of rows) {
      const sections = (row.sections ?? []).map((section) =>
        section.key === KEY && section.role === fromRole ? convert(section) : section,
      );
      await sequelize.query(
        `UPDATE service_translations SET sections = :sections::jsonb, updated_at = :now WHERE id = :id`,
        { replacements: { sections: JSON.stringify(sections), now: new Date(), id: row.id }, transaction },
      );
      console.log(`✅ ${row.slug} (${row.locale}): "${KEY}" is now role ${fromRole === "cards" ? "reviews" : "cards"}`);
    }
    if (!rows.length) console.log(`ℹ️  no "${KEY}" section with role ${fromRole}: nothing to change`);
  });
}

export async function up({ context: queryInterface }) {
  await apply(queryInterface, "cards", toReviews);
}

export async function down({ context: queryInterface }) {
  await apply(queryInterface, "reviews", toCards);
}
