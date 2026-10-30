// seeders/20261029100008-update-office-address.js
// Round 3, batch 5 (29 October 2026): the office address on the About page ("Visit us")
// is changed to the address on the live website, rapidconsulting.in:
//   Plot No 134, 1st Floor, Old Court Road, Near Payasam Restaurant, Hisar, Haryana 125001
//
// It replaces only the exact earlier text (the wireframe's address). If an editor has already
// changed that line in the dashboard, nothing is replaced. Running it again changes nothing.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100008-update-office-address

const OLD = "1st Floor, 134, Lajpat Nagar, Old Court Road, Hisar, Haryana 125001";
const NEW = "Plot No 134, 1st Floor, Old Court Road, Near Payasam Restaurant, Hisar, Haryana 125001";

const inJson = (value) => JSON.stringify(value).slice(1, -1);

async function apply(queryInterface, from, to) {
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    const rows = await sequelize.query(
      `SELECT id, path, sections::text AS sections, published_sections::text AS published
         FROM site_pages WHERE path = 'about' AND locale = 'en'`,
      { transaction, type: "SELECT" },
    );
    for (const row of rows) {
      const swap = (text) => (text ? text.split(inJson(from)).join(inJson(to)) : text);
      const sections = swap(row.sections);
      const published = swap(row.published);
      if (sections === row.sections && published === row.published) {
        console.log(`ℹ️  ${row.path}: nothing to change`);
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
      console.log(`✅ ${row.path}: office address updated`);
    }
  });
}

export async function up({ context: queryInterface }) {
  await apply(queryInterface, OLD, NEW);
}

export async function down({ context: queryInterface }) {
  await apply(queryInterface, NEW, OLD);
}
