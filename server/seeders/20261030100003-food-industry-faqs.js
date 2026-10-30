// seeders/20261030100003-food-industry-faqs.js
// 30 October 2026: the Food & Agro Processing industry page had one FAQ; the Figma
// industry page (Rapid Consulting — Design System, node 1407-68247) shows five more
// under "Questions food business owners ask". Their answers are taken from the
// prototype. They are added after the existing FAQ, in the same form
// (<p><strong>Question?</strong> Answer</p>). A question already on the page is not
// added again, so running it twice changes nothing.
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261030100003-food-industry-faqs

const SLUG = "food-and-agro-processing";
const ANCHOR = '<h2 id="discuss-your-requirement">';

const FAQS = [
  [
    "Can AIF and the state policy both apply?",
    "Yes. AIF can sit beside other central and state schemes, including capital subsidies. Each scheme’s rules decide whether the same cost can count under both, so plan which scheme pays for what before you apply.",
  ],
  [
    "Should we talk before ordering machinery?",
    "Yes. Some schemes only count costs after a set step, and a purchase can’t be made eligible later. If you’ve already ordered, share the real dates and we’ll tell you what’s still open.",
  ],
  [
    "Which FSSAI licence does my unit need?",
    "It depends on the kind of food business and its size: a basic registration, a state licence or a central licence. We check your category before you apply.",
  ],
  [
    "Does my existing CLU cover an expansion?",
    "Not automatically. Your CLU was given for a specific use, area and set of conditions. We check whether the new activity, building or land next door fits within it, or needs a fresh permission.",
  ],
  [
    "I already have a CA, architect or banker. Can they work with you?",
    "Yes. We handle the approvals and subsidy work, and share what your CA, architect or banker needs from us, so the numbers, drawings and applications match.",
  ],
];

const paragraph = ([question, answer]) => `<p><strong>${question}</strong> ${answer}</p>`;

async function apply(queryInterface, add) {
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    const [row] = await sequelize.query("SELECT id, content FROM industries WHERE slug = :slug", {
      replacements: { slug: SLUG },
      transaction,
      type: "SELECT",
    });
    if (!row?.content) {
      console.log(`ℹ️  ${SLUG}: no content, nothing to change`);
      return;
    }
    let content = row.content;
    if (add) {
      const missing = FAQS.filter(([question]) => !content.includes(question));
      const at = content.indexOf(ANCHOR);
      if (!missing.length || at < 0) {
        console.log(`ℹ️  ${SLUG}: nothing to add`);
        return;
      }
      content = `${content.slice(0, at)}${missing.map(paragraph).join("\n")}\n${content.slice(at)}`;
    } else {
      for (const faq of FAQS) content = content.replace(`${paragraph(faq)}\n`, "").replace(paragraph(faq), "");
    }
    if (content === row.content) {
      console.log(`ℹ️  ${SLUG}: nothing to change`);
      return;
    }
    await sequelize.query("UPDATE industries SET content = :content, updated_at = :now WHERE id = :id", {
      replacements: { content, now: new Date(), id: row.id },
      transaction,
    });
    console.log(`✅ ${SLUG}: FAQs ${add ? "added" : "removed"}`);
  });
}

export async function up({ context: queryInterface }) {
  await apply(queryInterface, true);
}

export async function down({ context: queryInterface }) {
  await apply(queryInterface, false);
}
