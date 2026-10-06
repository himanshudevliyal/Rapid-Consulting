// seeders/20261003100008-seed-schemes.js
// Seeds 59 government schemes into the schemes table.
// Source data mapped from static pages.json (formerly served as static content).
// Run: node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261003100008-seed-schemes

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadSchemes() {
  const filePath = join(__dirname, "data", "rapid-schemes.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function up({ context: queryInterface }) {
  const now = new Date();
  const schemes = loadSchemes();

  const rows = schemes.map((s) => ({
    id: uuidv4(),
    // The column is `title` (migration 20261003100008 renamed it from `name`);
    // the JSON file still calls it `name`.
    title: s.title ?? s.name,
    slug: s.slug,
    ministry: s.ministry ?? null,
    description: s.description ?? null,
    eligibility: s.eligibility ?? null,
    benefits: s.benefits ?? null,
    application_process: s.application_process ?? null,
    official_url: s.official_url ?? null,
    cover_image: s.cover_image ?? null,
    tags: s.tags ?? [],
    is_published: s.is_published ?? false,
    created_at: now,
    updated_at: now,
  }));

  await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.bulkInsert("schemes", rows, { transaction: t });
  });

  console.log(`✅ Seeded ${rows.length} schemes`);
}

export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete("schemes", null, {});
  console.log("⚠️  Rolled back: all schemes deleted");
}
