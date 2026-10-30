// seeders/20261024100002-update-clu-masthead.js
// Round 2 (October 2026): the Change in Land Use (CLU) service page (code D060,
// /services/change-in-land-use-clu) opens with this message, in the masthead:
//
//   Before you commit to the plot or start work, talk to Rapid.      (bold, first)
//   We check your land and CLU requirements to help you avoid costly mistakes.
//
// Where it lives: the masthead text of a service page is the English
// translation record of the service - table service_translations, column
// intro_html (rendered under the page heading by the website's ServiceHero;
// the heading itself is the h1 column, which is not changed).
//
// The old opening line of that text ("Put the right land-use permission behind
// your next factory ...") is kept as the third paragraph; the old second
// paragraph repeated the new message and is dropped. No guarantee, approval or
// savings claim is made.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261024100002-update-clu-masthead
//           (puts back the original two paragraphs from seeders/data/rapid-services.json)
//
// Safe to run again: if the text already contains the new first line nothing
// changes, so edits made later in the dashboard are not overwritten.
// After running, refresh the website cache (save the service in the dashboard,
// or wait for the website's revalidate interval).

import fs from "node:fs";

const CODE = "D060";
const HEADLINE = "Before you commit to the plot or start work, talk to Rapid.";
const SUPPORT = "We check your land and CLU requirements to help you avoid costly mistakes.";

const services = JSON.parse(
  fs.readFileSync(new URL("./data/rapid-services.json", import.meta.url), "utf8"),
);
const original = services
  .find((service) => service.code === CODE)
  ?.translations.find((translation) => translation.locale === "en")?.intro_html;

// The first paragraph of the existing text, if there is one.
const firstParagraph = (html) => (String(html ?? "").match(/<p>[\s\S]*?<\/p>/i) ?? [""])[0];

const findTranslation = (sequelize, transaction) =>
  sequelize
    .query(
      `SELECT t.id, t.intro_html
         FROM service_translations t
         JOIN services s ON s.id = t.service_id
        WHERE s.code = :code AND t.locale = 'en'`,
      { replacements: { code: CODE }, transaction, type: "SELECT" },
    )
    .then((rows) => rows[0]);

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;

  await sequelize.transaction(async (transaction) => {
    const translation = await findTranslation(sequelize, transaction);
    if (!translation) {
      console.log(`⚠️  Service ${CODE} (English) not found; nothing to update`);
      return;
    }
    if (String(translation.intro_html ?? "").includes(HEADLINE)) {
      console.log(`✔ ${CODE} masthead already has the new first line; left as it is`);
      return;
    }

    const lead = firstParagraph(translation.intro_html);
    const introHtml = [`<p><strong>${HEADLINE}</strong></p>`, `<p>${SUPPORT}</p>`, lead]
      .filter(Boolean)
      .join("\n")
      .concat("\n");

    await sequelize.query(
      "UPDATE service_translations SET intro_html = :intro, updated_at = :now WHERE id = :id",
      { replacements: { intro: introHtml, now: new Date(), id: translation.id }, transaction },
    );
    console.log(`✅ Updated ${CODE} masthead text (service_translations.intro_html, locale en)`);
  });
}

export async function down({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  if (!original) return;

  await sequelize.transaction(async (transaction) => {
    const translation = await findTranslation(sequelize, transaction);
    if (!translation || !String(translation.intro_html ?? "").includes(HEADLINE)) return;
    await sequelize.query(
      "UPDATE service_translations SET intro_html = :intro, updated_at = :now WHERE id = :id",
      { replacements: { intro: original, now: new Date(), id: translation.id }, transaction },
    );
  });
  console.log(`⚠️  Rolled back: ${CODE} masthead text restored`);
}
