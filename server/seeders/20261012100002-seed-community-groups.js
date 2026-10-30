// seeders/20261012100002-seed-community-groups.js
// Three placeholder community groups so the "join" blocks on the website show
// until the real groups exist. The text is deliberately generic and the join
// link is empty (the website then shows "coming soon" instead of a button).
// Edit or replace them in the dashboard (Community groups) once the real
// groups are ready - nothing here is a claim about an existing group.
//
// Placements (pages the group is shown on): home, industries, resources,
// advisers, schemes.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261012100002-seed-community-groups
//
// Run migration 20261012100001 first (it creates community_groups).
// Safe to run again: a group whose name already exists is skipped, never overwritten.

import { v4 as uuidv4 } from "uuid";

const GROUPS = [
  {
    name: "Industrial incentives updates",
    audience: "Business owners and finance teams following industrial incentives",
    updates: [
      "Plain-language summaries of new or changed incentive notifications",
      "Reminders when application windows open or close",
      "A pointer to the official source for every update",
    ].join("\n"),
    cadence: "Shared when there is something relevant",
    placements: ["industries", "home"],
    sort_order: 10,
  },
  {
    name: "Policy & subsidy alerts",
    audience: "Business owners tracking government policies and subsidy schemes",
    updates: [
      "Alerts about policy changes that may affect your plans",
      "Notes on schemes that open, close or change",
      "Links to the related guides and scheme pages",
    ].join("\n"),
    cadence: "Shared when there is something relevant",
    placements: ["resources", "schemes"],
    sort_order: 20,
  },
  {
    name: "Industry circle",
    audience: "Business owners and project teams who want to learn from peers",
    updates: [
      "Invitations to expert sessions",
      "Practical notes from the Rapid team",
      "Discussion with others working in your industry",
    ].join("\n"),
    cadence: "To be confirmed",
    placements: ["advisers", "home"],
    sort_order: 30,
  },
];

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  const now = new Date();
  let added = 0;

  await sequelize.transaction(async (transaction) => {
    for (const group of GROUPS) {
      const [existing] = await sequelize.query(
        "SELECT id FROM community_groups WHERE name = :name",
        { replacements: { name: group.name }, transaction, type: "SELECT" },
      );
      if (existing) continue;
      await queryInterface.bulkInsert(
        "community_groups",
        [
          {
            id: uuidv4(),
            name: group.name,
            audience: group.audience,
            updates: group.updates,
            cadence: group.cadence,
            join_url: "",
            placements: JSON.stringify(group.placements),
            is_active: true,
            sort_order: group.sort_order,
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );
      added++;
    }
  });

  console.log(`✅ Seeded ${added} placeholder community groups`);
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.query("DELETE FROM community_groups WHERE name IN (:names)", {
    replacements: { names: GROUPS.map((group) => group.name) },
  });
  console.log("⚠️  Rolled back: placeholder community groups removed");
}
