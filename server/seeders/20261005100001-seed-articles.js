// seeders/20261005100001-seed-articles.js
// Seeds the 41 website articles into the articles table.
// Source data: the website's static pages.json (type "article", English), with
// /en/p/<ID> links already rewritten to slug URLs. See data/rapid-articles.json.
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261005100001-seed-articles
//           (deletes the articles with these 41 slugs, nothing else)
//
// Safe to run on a table that already has articles: a slug that already
// exists is skipped, never overwritten.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import { DataTypes } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadArticles() {
  const filePath = join(__dirname, "data", "rapid-articles.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function up({ context: queryInterface }) {
  const now = new Date();
  const articles = loadArticles();

  // published_at is staggered by one second per article so the API's
  // "newest first" order matches the website's order (B001 first) and
  // pagination is stable. Edit real dates later in the admin panel.
  const rows = articles.map((a, i) => {
    const publishedAt = new Date(now.getTime() - i * 1000);
    return {
      id: uuidv4(),
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? null,
      content: a.content ?? null,
      cover_image: a.cover_image ?? null,
      tags: a.tags ?? [],
      is_published: a.is_published ?? false,
      published_at: a.is_published ? publishedAt : null,
      created_at: now,
      updated_at: now,
    };
  });

  const countSeeded = async () => {
    const [{ count }] = await queryInterface.sequelize.query(
      "SELECT COUNT(*)::int AS count FROM articles WHERE slug IN (:slugs)",
      { replacements: { slugs: rows.map((r) => r.slug) }, type: "SELECT" },
    );
    return count;
  };
  const before = await countSeeded();

  await queryInterface.sequelize.transaction(async (t) => {
    // `tags` needs its column type so an empty array is cast to TEXT[].
    await queryInterface.bulkInsert("articles", rows, {
      transaction: t,
      ignoreDuplicates: true, // ON CONFLICT DO NOTHING (slug is unique)
    }, { tags: { type: new DataTypes.ARRAY(DataTypes.TEXT) } });
  });

  const inserted = (await countSeeded()) - before;
  console.log(
    `✅ Articles seeded: ${inserted} inserted, ${rows.length - inserted} skipped (slug already existed)`,
  );
}

export async function down({ context: queryInterface }) {
  const slugs = loadArticles().map((a) => a.slug);
  await queryInterface.bulkDelete("articles", { slug: slugs }, {});
  console.log(`⚠️  Rolled back: ${slugs.length} seeded articles deleted`);
}
