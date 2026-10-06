// seeders/20261006120001-seed-case-studies.js
// Seeds the 3 website case studies into the case_studies table.
// Source data: the website's static pages.json (type "case-study", English),
// with /en/p/<ID> links already rewritten to slug URLs. See data/rapid-case-studies.json.
// The page text is split into the three story fields: `challenge` (intro and
// background), `solution` (what Rapid did) and `result` (outcome and lesson).
// The website's own contact call-to-action section is left out.
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261006120001-seed-case-studies
//           (deletes the case studies with these 3 slugs, nothing else)
//
// The website marks these three as "Publication hold", so they are seeded as
// drafts (is_published = false). Tick "Published" in the dashboard when each
// one is cleared to go live.
//
// Safe to run on a table that already has case studies: a slug that already
// exists is skipped, never overwritten.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import { DataTypes } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadCaseStudies() {
  const filePath = join(__dirname, "data", "rapid-case-studies.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function up({ context: queryInterface }) {
  const now = new Date();
  const caseStudies = loadCaseStudies();

  const rows = caseStudies.map((c) => ({
    id: uuidv4(),
    title: c.title,
    slug: c.slug,
    client_name: c.client_name ?? null,
    industry: c.industry ?? null,
    challenge: c.challenge ?? null,
    solution: c.solution ?? null,
    result: c.result ?? null,
    cover_image: c.cover_image ?? null,
    tags: c.tags ?? [],
    is_published: c.is_published ?? false,
    // The publish date is set by the dashboard the first time it is published.
    published_at: null,
    created_at: now,
    updated_at: now,
  }));

  const countSeeded = async () => {
    const [{ count }] = await queryInterface.sequelize.query(
      "SELECT COUNT(*)::int AS count FROM case_studies WHERE slug IN (:slugs)",
      { replacements: { slugs: rows.map((r) => r.slug) }, type: "SELECT" },
    );
    return count;
  };
  const before = await countSeeded();

  await queryInterface.sequelize.transaction(async (t) => {
    // `tags` needs its column type so an empty array is cast to TEXT[].
    await queryInterface.bulkInsert("case_studies", rows, {
      transaction: t,
      ignoreDuplicates: true, // ON CONFLICT DO NOTHING (slug is unique)
    }, { tags: { type: new DataTypes.ARRAY(DataTypes.TEXT) } });
  });

  const inserted = (await countSeeded()) - before;
  console.log(
    `✅ Case studies seeded: ${inserted} inserted, ${rows.length - inserted} skipped (slug already existed)`,
  );
}

export async function down({ context: queryInterface }) {
  const slugs = loadCaseStudies().map((c) => c.slug);
  await queryInterface.bulkDelete("case_studies", { slug: slugs }, {});
  console.log(`⚠️  Rolled back: ${slugs.length} seeded case studies deleted`);
}
