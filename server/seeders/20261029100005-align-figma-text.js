// seeders/20261029100005-align-figma-text.js
// Round 3, batch 4 (29 October 2026): small wording fixes so the hub pages read
// exactly as the Figma wireframe does. The wireframe was read again, page by
// page, and every line that differed from the stored text is listed below.
//
// Each fix replaces one exact piece of the earlier seeded text. If an editor
// has already changed that piece in the dashboard, the old text is no longer
// there and nothing is replaced, so an edit is never overwritten. Running the
// seeder again changes nothing.
//
// Pages: your-project, approvals, subsidies, your-project/setting-up (English).
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100005-align-figma-text
//           (puts the earlier wording back)

const FIXES = {
  "your-project": [
    ["approval name by name", "approval by name"],
    ["checked in one report.", "checked in writing."],
    [
      "Consents, fire NOC and licences each have renewal windows. Miss a renewal and you may pay a penalty or apply again. Miss a claim window and the benefit can be lost.",
      "Consents, licences and insurance all have renewal dates, and subsidy claims have windows. Miss a renewal and you may pay a penalty or apply again. Miss a claim window and the benefit can be lost.",
    ],
    ["Tell us where your project is.", "Tell us about your project."],
  ],
  approvals: [
    ["Your unit has a pollution category", "Your activity has a pollution category"],
    ["Hazardous waste from your process?", "Hazardous waste in your process?"],
    ["Questions about approvals.", "Common questions about approvals"],
  ],
  subsidies: [
    ["Fire and safety equipment subsidy", "Fire and pollution equipment subsidy"],
    ["ISO, ZED or a patent?", "Done ISO, ZED or a patent?"],
    ["You plan a warehouse or cold storage", "You're building a warehouse or cold storage"],
    ["You plan a dairy, meat or feed unit", "You run a dairy, meat or feed unit"],
    ["Questions about subsidies.", "Common questions about subsidies"],
  ],
  "your-project/setting-up": [["You can start building. The approval will follow.", "Start building. The approvals can follow."]],
};

// JSON text of a string, without the surrounding quotes.
const inJson = (value) => JSON.stringify(value).slice(1, -1);

async function apply(queryInterface, reverse) {
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    for (const [path, fixes] of Object.entries(FIXES)) {
      const rows = await sequelize.query(
        `SELECT id, sections::text AS sections, published_sections::text AS published
           FROM site_pages WHERE path = :path AND locale = 'en'`,
        { replacements: { path }, transaction, type: "SELECT" },
      );
      for (const row of rows) {
        let changed = 0;
        const rewrite = (text) => {
          if (!text) return text;
          let out = text;
          for (const [from, to] of fixes) {
            const [oldText, newText] = reverse ? [to, from] : [from, to];
            const before = inJson(oldText);
            if (out.includes(before)) {
              out = out.split(before).join(inJson(newText));
              changed += 1;
            }
          }
          return out;
        };
        const sections = rewrite(row.sections);
        const published = rewrite(row.published);
        if (!changed) {
          console.log(`ℹ️  ${path}: nothing to change`);
          continue;
        }
        await sequelize.query(
          `UPDATE site_pages
              SET sections = :sections::jsonb,
                  published_sections = CASE WHEN :published::text IS NULL THEN NULL ELSE :published::jsonb END,
                  updated_at = :now
            WHERE id = :id`,
          { replacements: { sections, published: published ?? null, now: new Date(), id: row.id }, transaction },
        );
        console.log(`✅ ${path}: ${changed} wording fix(es) ${reverse ? "undone" : "applied"}`);
      }
    }
  });
}

export async function up({ context: queryInterface }) {
  await apply(queryInterface, false);
}

export async function down({ context: queryInterface }) {
  await apply(queryInterface, true);
}
