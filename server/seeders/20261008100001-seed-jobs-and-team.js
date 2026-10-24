// seeders/20261008100001-seed-jobs-and-team.js
// Moves the careers and team content that was built into the website to the
// database, so the site renders it from the API:
//
//   1. Jobs (3)      the three open roles of the careers page, active
//                    (slugs match the website's old role URLs, so old links keep working)
//   2. Advisers (1)  the team member that had a real name (Atul Goyal, "Leadership").
//                    The other team cards were "Name to be added" placeholders - add the
//                    real people in the dashboard (Advisers) and they appear on the About page.
//
// Source data: data/rapid-jobs-team.json (taken from the website's static pages).
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261008100001-seed-jobs-and-team
//
// Run migration 20261008100001 first (it adds advisers.team_group).
// Safe to run again: a job (by slug) or adviser (by name) that already exists is skipped.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const load = () =>
  JSON.parse(readFileSync(join(__dirname, "data", "rapid-jobs-team.json"), "utf8"));

export async function up({ context: queryInterface }) {
  const data = load();
  const now = new Date();
  const sequelize = queryInterface.sequelize;
  const log = { jobs: 0, advisers: 0 };

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "SELECT" });

    // 1. Jobs: newest first on the website, so the first one gets the latest date
    for (const [index, job] of data.jobs.entries()) {
      const [existing] = await select("SELECT id FROM jobs WHERE slug = :slug", { slug: job.slug });
      if (existing) continue;
      const created = new Date(now.getTime() - index * 1000);
      await queryInterface.bulkInsert(
        "jobs",
        [
          {
            id: uuidv4(),
            title: job.title,
            slug: job.slug,
            location: job.location ?? null,
            job_type: job.job_type ?? "full-time",
            experience: job.experience ?? null,
            description: job.description ?? null,
            responsibilities: job.responsibilities ?? null,
            requirements: job.requirements ?? null,
            closing_date: job.closing_date ?? null,
            is_active: job.is_active ?? true,
            created_at: created,
            updated_at: created,
          },
        ],
        { transaction },
      );
      log.jobs++;
    }

    // 2. Advisers (team)
    for (const adviser of data.advisers) {
      const [existing] = await select("SELECT id FROM advisers WHERE name = :name", {
        name: adviser.name,
      });
      if (existing) continue;
      await queryInterface.bulkInsert(
        "advisers",
        [
          {
            id: uuidv4(),
            name: adviser.name,
            designation: adviser.designation ?? null,
            team_group: adviser.team_group ?? null,
            bio: adviser.bio ?? null,
            photo: adviser.photo ?? null,
            linkedin_url: adviser.linkedin_url ?? null,
            display_order: adviser.display_order ?? 0,
            is_active: adviser.is_active ?? true,
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );
      log.advisers++;
    }
  });

  console.log(`✅ Seeded ${log.jobs} jobs and ${log.advisers} advisers (team)`);
}

export async function down({ context: queryInterface }) {
  const data = load();
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    await sequelize.query("DELETE FROM jobs WHERE slug IN (:slugs)", {
      replacements: { slugs: data.jobs.map((job) => job.slug) },
      transaction,
    });
    await sequelize.query("DELETE FROM advisers WHERE name IN (:names)", {
      replacements: { names: data.advisers.map((adviser) => adviser.name) },
      transaction,
    });
  });
  console.log("⚠️  Rolled back: seeded jobs and team members removed");
}
