// seeders/20261030100002-clu-faq-answers.js
// 30 October 2026: the answers of the "Common CLU questions" FAQs on the Change of Land
// Use (CLU) service page, taken from the Figma prototype (Rapid Consulting — Design
// System, "Three-page review", node 1053-33614). The first seed only had the answer
// that was open in the frame; the other seven were left empty.
//
// Only an empty answer is filled; an answer an editor has already written is kept.
// Running it again changes nothing.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261030100002-clu-faq-answers

const SLUG = "change-in-land-use-clu";

const ANSWERS = {
  "Is there a minimum land area for CLU in Haryana?":
    "<p>For industry, usually not. Size rarely stops you: there’s no minimum in the industrial or farmland zones. The plan’s transport zone needs at least 0.5 acre, and farmland within 2 km of a medium-potential town is capped at 5 acres. On farmland around the biggest towns, factories aren’t allowed at all.</p>",
  "What are the CLU charges in Haryana?":
    "<p>An application fee of ₹10 per sq m, then conversion charges and, in some areas, development charges, all set by your area. We work out the amounts for your plot upfront. MSMEs and some sectors pay half in less-developed blocks (categories B, C and D).</p>",
  "Does my existing CLU cover an expansion?":
    "<p>Not automatically. Your CLU was given for a specific use, area and set of conditions. We check whether the new activity, building or land next door fits within it, or needs a fresh permission.</p>",
  "How long is a CLU valid, and can it be extended?":
    "<p>Two years to build and start using the land, for sites up to 25 acres (other than multi-storey buildings). If you need more time, it can be renewed. We’ll tell you what renewal involves for your plot.</p>",
  "Do I need CLU for a plot in an HSIIDC estate?":
    "<p>No. Plots in HSIIDC industrial estates follow the estate’s own building rules, and your building plans are filed with HSIIDC.</p>",
  "What happens if CLU is refused?":
    "<p>We go through the reasons with you. If they can be fixed (land records, road access, how your unit is described), we prepare a revised application. If the rules don’t allow your unit on that plot, we tell you plainly, so you can look at another plot instead of losing more time.</p>",
  "Do you guarantee approval?":
    "<p>No. The department decides. What we promise is to tell you early if the rules don’t support your plot, and to do the preparation, paperwork and follow-up properly if they do.</p>",
};

// fill: put the Figma answer into an empty one. clear: empty an answer that is still exactly the Figma text.
async function apply(queryInterface, mode) {
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    const rows = await sequelize.query(
      `SELECT st.id, st.sections FROM service_translations st JOIN services s ON s.id = st.service_id
        WHERE s.slug = :slug AND st.locale = 'en'`,
      { replacements: { slug: SLUG }, transaction, type: "SELECT" },
    );
    for (const row of rows) {
      let changed = 0;
      const sections = (row.sections ?? []).map((section) => {
        if (section.role !== "faq") return section;
        const items = (section.items ?? []).map((item) => {
          const answer = ANSWERS[item.title?.trim()];
          if (!answer) return item;
          if (mode === "fill" && !(item.html ?? "").trim()) {
            changed += 1;
            return { ...item, html: answer };
          }
          if (mode === "clear" && item.html === answer) {
            changed += 1;
            return { ...item, html: "" };
          }
          return item;
        });
        return { ...section, items };
      });
      if (!changed) {
        console.log(`ℹ️  ${SLUG}: nothing to change`);
        continue;
      }
      await sequelize.query(
        `UPDATE service_translations SET sections = :sections::jsonb, updated_at = :now WHERE id = :id`,
        { replacements: { sections: JSON.stringify(sections), now: new Date(), id: row.id }, transaction },
      );
      console.log(`✅ ${SLUG}: ${changed} FAQ answer(s) ${mode === "fill" ? "filled in" : "cleared"}`);
    }
  });
}

export async function up({ context: queryInterface }) {
  await apply(queryInterface, "fill");
}

export async function down({ context: queryInterface }) {
  await apply(queryInterface, "clear");
}
