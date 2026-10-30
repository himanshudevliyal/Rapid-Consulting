// seeders/20261029100004-seed-figma-records.js
// Round 3, batch 4 (29 October 2026): the records that drive detail pages now
// carry the Figma wireframe text, so every word is editable in the dashboard.
//
//   service    D060  Change of Land Use (CLU)            /services/change-in-land-use-clu
//   guide      change-of-land-use-clu-haryana (B035)     /guides/change-of-land-use-clu-haryana
//   case       testing-equipment-subsidy-support-...-sirsa  /case-studies/...
//   industry   food-and-agro-processing                  /industries/food-and-agro-processing
//   scheme     agricultural-infrastructure-fund-aif      /schemes/agricultural-infrastructure-fund-aif
//
// Only these records are touched (matched by code or slug; a missing record is
// skipped with a log line). Fields the Figma text does not cover are left as
// they are. The text is the Rapid-approved wireframe text word for word;
// placeholders such as [Name], XX, X.X and [date] are kept as written, and
// anything the transcription marks as not seen is left empty. Data:
// seeders/data/figma-records.json.
//
// Service sections use the roles quick_answers, eligibility, stuck_file,
// hero_points, video, cases, panel_navy, panel_grey and cards, plus an optional
// `eyebrow` on every section (see doc/MANAGED-CONTRACT.md / SERVICES-API.md).
// Inside those sections a paragraph that holds one link only is a button:
// <p><a href="#enquire">Label</a></p> opens the enquiry form.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100004-seed-figma-records
//           (does not restore the earlier text; the earlier service sections
//           are in seeders/data/rapid-services.json)
//
// Running it again writes the same text again. After running, save a record in
// the dashboard (or wait for the website's revalidate interval) to refresh the
// website cache.

import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("./data/figma-records.json", import.meta.url), "utf8"));

const q = (sequelize, transaction, sql, replacements) =>
  sequelize.query(sql, { replacements, transaction, type: "SELECT" });

// Builds "UPDATE table SET a = :a, b = :b::jsonb ..." for the fields that are in `values`.
async function update(sequelize, transaction, table, id, values, jsonFields = []) {
  const keys = Object.keys(values);
  if (!keys.length) return;
  const sets = keys.map((key) => `"${key}" = :${key}${jsonFields.includes(key) ? "::jsonb" : ""}`).join(", ");
  const replacements = { id, now: new Date() };
  for (const key of keys) {
    replacements[key] = jsonFields.includes(key) ? JSON.stringify(values[key]) : values[key];
  }
  await sequelize.query(`UPDATE "${table}" SET ${sets}, "updated_at" = :now WHERE id = :id`, { replacements, transaction });
}

async function seedServices(sequelize, transaction) {
  for (const record of data.services ?? []) {
    const [row] = await q(
      sequelize,
      transaction,
      `SELECT t.id FROM service_translations t JOIN services s ON s.id = t.service_id
        WHERE s.code = :code AND t.locale = :locale`,
      { code: record.code, locale: record.locale },
    );
    if (!row) {
      console.log(`⚠️  Service ${record.code} (${record.locale}) not found; skipped`);
      continue;
    }
    const { code, locale, ...fields } = record; // eslint-disable-line no-unused-vars
    await update(sequelize, transaction, "service_translations", row.id, fields, ["sections"]);
    console.log(`✅ Service ${record.code}: Figma text written (${fields.sections?.length ?? 0} sections)`);
  }
}

async function seedArticles(sequelize, transaction) {
  for (const record of data.articles ?? []) {
    const { slug, ...fields } = record;
    const [row] = await q(sequelize, transaction, "SELECT id FROM articles WHERE slug = :slug", { slug });
    if (!row) {
      console.log(`⚠️  Guide/article "${slug}" not found; skipped`);
      continue;
    }
    await update(sequelize, transaction, "articles", row.id, fields);
    console.log(`✅ Guide/article ${slug}: Figma text written`);
  }
}

async function seedCases(sequelize, transaction) {
  for (const record of data.cases ?? []) {
    const { slug, add_tags: addTags = [], ...fields } = record;
    const [row] = await q(sequelize, transaction, "SELECT id, tags FROM case_studies WHERE slug = :slug", { slug });
    if (!row) {
      console.log(`⚠️  Case study "${slug}" not found; skipped`);
      continue;
    }
    // Tags written here are added to the ones the record already has.
    const tags = [...new Set([...(row.tags ?? []), ...addTags])];
    await sequelize.query(
      `UPDATE case_studies SET tags = ARRAY[:tags]::text[] WHERE id = :id`,
      { replacements: { tags, id: row.id }, transaction },
    );
    await update(sequelize, transaction, "case_studies", row.id, fields);
    console.log(`✅ Case study ${slug}: Figma text written`);
  }
}

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    await seedServices(sequelize, transaction);
    await seedArticles(sequelize, transaction);
    await seedCases(sequelize, transaction);
  });
}

export async function down() {
  console.log("⚠️  Nothing restored: the earlier text of these records is not kept by this seeder");
}
