// seeders/20261007100001-seed-site-content.js
// Moves the website's remaining built-in content to the database so the site
// can render it from the API:
//
//   1. Service categories    one per service family (5), in the `categories` table
//   2. Services              every service of a family is assigned to that family's category
//   3. Industries (4)        full pages: heading, intro, body, SEO, picture, related
//                            services and schemes (a placeholder picture is copied
//                            to public/images - replace it in the dashboard)
//   4. Guides (8)            articles with type "guide", published
//   5. Articles (41)         already seeded; only their category and SEO title are filled
//   6. Schemes (59)          already seeded as drafts; now published, given a topic tag
//                            and category, and 6 are marked featured (home page).
//                            53 slugs are renamed to the website's existing URLs so old
//                            links keep working.
//   7. Case studies (3)      already seeded as drafts; now published
//
// Source data: the website's static pages.json (English). Links of the form
// /en/p/<ID> are already rewritten to real URLs. See data/rapid-site-content.json.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261007100001-seed-site-content
//           (removes the guides, industries and categories created here; schemes and
//            case studies stay as they are)
//
// Run migration 20261007100001 first (it adds the new columns).
// Safe to run again: rows that already exist (by slug) are skipped, never overwritten,
// and a service / article / scheme that already has a category keeps it.

import { readFileSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import { DataTypes } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEXT_ARRAY = { type: new DataTypes.ARRAY(DataTypes.TEXT) };

const load = () =>
  JSON.parse(readFileSync(join(__dirname, "data", "rapid-site-content.json"), "utf-8"));

// Pictures are saved where the upload API saves them: <server>/public/images.
const copyImages = (industries) => {
  const target = join(process.cwd(), "public", "images");
  mkdirSync(target, { recursive: true });
  let copied = 0;
  for (const industry of industries) {
    const from = join(__dirname, "data", "images", industry.image_file);
    const to = join(target, industry.image_file);
    if (existsSync(from) && !existsSync(to)) {
      copyFileSync(from, to);
      copied++;
    }
  }
  return copied;
};

export async function up({ context: queryInterface }) {
  const data = load();
  const now = new Date();
  const sequelize = queryInterface.sequelize;
  const log = {};

  await sequelize.transaction(async (transaction) => {
    const run = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "RAW" });
    const select = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "SELECT" });

    // 1. Categories (created in order: the menu shows them in this order)
    const categoryId = {};
    log.categories = 0;
    for (const [index, category] of data.categories.entries()) {
      const [existing] = await select("SELECT id FROM categories WHERE slug = :slug", {
        slug: category.slug,
      });
      if (existing) {
        categoryId[category.slug] = existing.id;
        continue;
      }
      const id = uuidv4();
      const created = new Date(now.getTime() + index * 1000);
      await run(
        `INSERT INTO categories (id, title, slug, featured, pictures, created_at, updated_at)
         VALUES (:id, :title, :slug, false, '[]'::jsonb, :created, :created)`,
        { id, title: category.title, slug: category.slug, created },
      );
      categoryId[category.slug] = id;
      log.categories++;
    }

    // 2. Services -> category of their family (the family page itself too)
    log.services = 0;
    for (const category of data.categories) {
      const [, meta] = await run(
        `UPDATE services SET category_id = :id, updated_at = :now
          WHERE category_id IS NULL AND (family_code = :family OR code = :family)`,
        { id: categoryId[category.slug], family: category.family_code, now },
      );
      log.services += meta?.rowCount ?? 0;
    }

    // 3. Industries
    const industryRows = data.industries.map((i) => ({
      id: uuidv4(),
      name: i.name,
      slug: i.slug,
      description: i.description ?? null,
      icon: i.icon ?? null,
      display_order: i.display_order ?? 0,
      is_active: i.is_active ?? true,
      h1: i.h1 ?? null,
      meta_title: i.meta_title ?? null,
      meta_description: i.meta_description ?? null,
      intro: i.intro ?? null,
      content: i.content ?? null,
      image: i.image ?? null,
      note: i.note ?? null,
      service_slugs: i.service_slugs ?? [],
      scheme_slugs: i.scheme_slugs ?? [],
      created_at: now,
      updated_at: now,
    }));
    await queryInterface.bulkInsert(
      "industries",
      industryRows,
      { transaction, ignoreDuplicates: true },
      { service_slugs: TEXT_ARRAY, scheme_slugs: TEXT_ARRAY },
    );
    log.industries = industryRows.length;

    // 4. Guides: published, newest first in the order of the website
    const guideRows = data.guides.map((g, index) => ({
      id: uuidv4(),
      title: g.title,
      slug: g.slug,
      excerpt: g.excerpt ?? null,
      content: g.content ?? null,
      cover_image: null,
      category_id: categoryId[g.category] ?? null,
      type: "guide",
      tags: g.tags ?? [],
      is_published: true,
      published_at: new Date(now.getTime() - index * 1000),
      meta_title: g.meta_title ?? null,
      meta_description: g.meta_description ?? null,
      created_at: now,
      updated_at: now,
    }));
    await queryInterface.bulkInsert(
      "articles",
      guideRows,
      { transaction, ignoreDuplicates: true },
      { tags: TEXT_ARRAY },
    );
    log.guides = guideRows.length;

    // 5. Articles: category + SEO title where still empty
    for (const article of data.article_updates) {
      await run(
        `UPDATE articles
            SET category_id = COALESCE(category_id, :category),
                meta_title = COALESCE(meta_title, :meta),
                updated_at = :now
          WHERE slug = :slug`,
        {
          slug: article.slug,
          category: article.category ? categoryId[article.category] : null,
          meta: article.meta_title ?? null,
          now,
        },
      );
    }

    // 6. Schemes: website URL slug, publish, topic tag, category, featured
    for (const scheme of data.schemes) {
      if (scheme.seed_slug !== scheme.slug) {
        await run(
          `UPDATE schemes SET slug = :slug
            WHERE slug = :seed AND NOT EXISTS (SELECT 1 FROM schemes WHERE slug = :slug)`,
          { slug: scheme.slug, seed: scheme.seed_slug },
        );
      }
      await run(
        `UPDATE schemes
            SET is_published = true,
                is_featured = :featured,
                category_id = COALESCE(category_id, :category),
                tags = CASE WHEN tags = '{}'::text[] OR tags = ARRAY[:family]::text[]
                            THEN ARRAY[:topic]::text[] ELSE tags END,
                updated_at = :now
          WHERE slug = :slug`,
        {
          slug: scheme.slug,
          featured: scheme.featured,
          family: scheme.family_code,
          topic: scheme.topic,
          category: scheme.category ? categoryId[scheme.category] : null,
          now,
        },
      );
    }
    log.schemes = data.schemes.length;

    // 7. Case studies: publish
    await run(
      `UPDATE case_studies
          SET is_published = true, published_at = COALESCE(published_at, :now), updated_at = :now
        WHERE slug IN (:slugs)`,
      { slugs: data.case_study_slugs, now },
    );
    log.case_studies = data.case_study_slugs.length;
  });

  const copied = copyImages(data.industries);

  console.log(
    `✅ Site content: ${log.categories} new categories, ${log.services} services categorised, ` +
      `${log.industries} industries, ${log.guides} guides, ${log.schemes} schemes published, ` +
      `${log.case_studies} case studies published, ${copied} industry pictures copied`,
  );
}

export async function down({ context: queryInterface }) {
  const data = load();
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    const remove = (sql, replacements) =>
      sequelize.query(sql, { replacements, transaction, type: "RAW" });
    await remove("DELETE FROM industries WHERE slug IN (:slugs)", {
      slugs: data.industries.map((i) => i.slug),
    });
    await remove("DELETE FROM articles WHERE type = 'guide' AND slug IN (:slugs)", {
      slugs: data.guides.map((g) => g.slug),
    });
    // Services / articles / schemes that pointed at these categories are set to
    // "no category" by the foreign key.
    await remove("DELETE FROM categories WHERE slug IN (:slugs)", {
      slugs: data.categories.map((c) => c.slug),
    });
  });
  console.log("⚠️  Rolled back: guides, industries and service categories removed (schemes and case studies left as they are)");
}
