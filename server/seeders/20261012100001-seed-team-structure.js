// seeders/20261012100001-seed-team-structure.js
// Gives the About page the agreed team structure (design revision, slide 21):
//
//   Leadership      3 cards
//   Experts         4 cards
//   The Wider Team  4 cards
//
// Real people that already exist are kept. Each group is filled up to its
// size with clearly labelled placeholders ("is_placeholder", designation
// "To be confirmed") so the layout shows until real names, photos and bios
// arrive. Replace them in the dashboard (Advisers): rename the card, add the
// photo / bio / expertise and untick "placeholder". The Experts and Wider Team
// groups can grow - just add more people to the group.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261012100001-seed-team-structure
//           (removes only the placeholders created here that are still placeholders)
//
// Run migration 20261012100001 first (it adds advisers.slug / is_placeholder).
// Safe to run again: a group that already has enough people gets nothing, and a
// placeholder name that already exists is skipped.

import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

const GROUPS = [
  { group: "Leadership", size: 3, label: "Leadership member", order: 0 },
  { group: "Experts", size: 4, label: "Expert consultant", order: 100 },
  { group: "The Wider Team", size: 4, label: "Team member", order: 200 },
];

const makeSlug = (value) => slugify(value, { lower: true, strict: true });
const placeholderNames = ({ label, size }) =>
  Array.from({ length: size }, (_, index) => `${label} ${index + 1}`);

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  const now = new Date();
  let added = 0;

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements = {}) =>
      sequelize.query(sql, { replacements, transaction, type: "SELECT" });

    const slugs = new Set(
      (await select("SELECT slug FROM advisers WHERE slug IS NOT NULL")).map((row) => row.slug),
    );

    // People added before slugs existed (for example by the first team seeder)
    // get theirs now, so every person has a profile page.
    const unnamed = await select("SELECT id, name FROM advisers WHERE slug IS NULL OR slug = ''");
    for (const person of unnamed) {
      const base = makeSlug(person.name) || "team-member";
      let slug = base;
      for (let n = 2; slugs.has(slug); n += 1) slug = `${base}-${n}`;
      slugs.add(slug);
      await sequelize.query("UPDATE advisers SET slug = :slug, updated_at = :now WHERE id = :id", {
        replacements: { slug, now, id: person.id },
        transaction,
      });
    }

    for (const { group, size, label, order } of GROUPS) {
      const [{ count }] = await select(
        "SELECT COUNT(*)::int AS count FROM advisers WHERE team_group = :group",
        { group },
      );
      let missing = size - count;

      for (let n = 1; missing > 0 && n <= size * 3; n++) {
        const name = `${label} ${n}`;
        const [existing] = await select("SELECT id FROM advisers WHERE name = :name", { name });
        if (existing) continue;

        let slug = makeSlug(name);
        for (let i = 2; slugs.has(slug); i++) slug = `${makeSlug(name)}-${i}`;
        slugs.add(slug);

        await queryInterface.bulkInsert(
          "advisers",
          [
            {
              id: uuidv4(),
              name,
              slug,
              designation: "To be confirmed",
              team_group: group,
              bio: null,
              expertise: null,
              photo: null,
              linkedin_url: null,
              display_order: order + n,
              is_active: true,
              is_placeholder: true,
              created_at: now,
              updated_at: now,
            },
          ],
          { transaction },
        );
        missing--;
        added++;
      }
    }
  });

  console.log(`✅ Seeded ${added} placeholder team cards (Leadership 3 / Experts 4 / The Wider Team 4)`);
}

export async function down({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  const names = GROUPS.flatMap(placeholderNames);
  await sequelize.query(
    "DELETE FROM advisers WHERE name IN (:names) AND is_placeholder = true",
    { replacements: { names } },
  );
  console.log("⚠️  Rolled back: placeholder team cards removed");
}
