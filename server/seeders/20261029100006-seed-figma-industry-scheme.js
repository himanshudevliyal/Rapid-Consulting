// seeders/20261029100006-seed-figma-industry-scheme.js
// Round 3, batch 4 (29 October 2026): the Figma wireframe text for
//   industry  food-and-agro-processing   /industries/food-and-agro-processing
//   scheme    agricultural-infrastructure-fund-aif   /schemes/agricultural-infrastructure-fund-aif
// is written into those two records, so every word can be edited in the
// dashboard (Industries / Schemes).
//
// The text is the Rapid wireframe text word for word. Placeholders such as
// [date], XX and X.X are kept as written. Anything the wireframe did not show
// (the answers to FAQs 2 onwards, the fourth testimonial, the Guides and Reports
// tabs) is not written. The industry's linked services and schemes, its image
// and its note are not touched.
//
// Industry body: each <h2> is one block of the page.
//   Your project / What you can claim / Watch out / One report / Cases /
//   FAQs / Next step / Author and sources. The <h3> headings under "Your
//   project" are the project types; a paragraph with links under an <h3> becomes
//   the links of the card.
// Scheme: description = opening line, eligibility = "Does it fit" and "Who can
//   apply", benefits = "What you get" and "Watch out", application_process =
//   "How it's claimed".
//
// Run:      node scripts/seed.js up
// Rollback: node scripts/seed.js down 20261029100006-seed-figma-industry-scheme
//           (does not restore the earlier text)
// Running it again writes the same text again. Save a record in the dashboard
// (or wait for the revalidate interval) to refresh the website cache.

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const esc = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const h = (level, text) => `<h${level} id="${slugify(text)}">${esc(text)}</h${level}>`;
const p = (text) => `<p>${esc(text)}</p>`;
const ul = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
const li = (lead, rest) => `<strong>${esc(lead)}</strong> ${esc(rest)}`;
const link = (href, label) => `<a href="${href}">${esc(label)}</a>`;

// ── Industry: food and agro processing ───────────────────────────────────────

const industry = {
  slug: "food-and-agro-processing",
  h1: "Two consultants, two different schemes. The wrong choice can cost you the bigger benefit.",
  intro: p(
    "Food and agro processing in Haryana: the subsidies, approvals and bank finance for a mill, dairy or food plant, worked out together.",
  ),
  content: [
    h(2, "Your project"),
    p("Start with what you're setting up."),
    h(3, "A new rice or oil mill"),
    p("Whether the land can take the mill, the order of approvals, and the subsidy route before you order machinery."),
    `<p>${link("/services/change-in-land-use-clu", "Change of Land Use")}</p>`,
    `<p>${link("/approvals", "Approvals for your factory")}</p>`,
    `<p>${link("/subsidies", "Subsidies for your project")}</p>`,
    h(3, "Dairy, sweets or packaged food"),
    h(3, "Cold storage or a pack house"),
    h(3, "Expanding a running unit"),
    h(3, "Testing or safety equipment"),

    h(2, "What you can claim"),
    p("What a food unit can claim, and from where."),
    "<table><thead><tr><th>Kind of support</th><th>What it pays back</th><th>Schemes to look at</th></tr></thead><tbody>" +
      [
        [
          "Capital subsidy",
          "Part of what you spend on building, plant and machinery",
          "CEFPPC · Agro-processing clusters · Agricultural Marketing Infrastructure · Integrated cold chain · NHB · NHM (all being checked)",
        ],
        [
          "Interest support",
          "Part of the interest on your term loan",
          "Agriculture Infrastructure Fund · AHIDF (dairy, meat and feed) (both being checked)",
        ],
        [
          "State benefits",
          "Taxes, duties and wage costs: SGST, stamp duty, electricity duty, employment",
          "Haryana's policy changed on 29 July 2026",
        ],
        [
          "Testing and safety equipment",
          "Part of what you spend on testing machines and fire safety",
          "Testing equipment · Fire equipment (both being checked)",
        ],
        ["Certification", "The cost of quality certification", "ZED certification"],
        ["Export support", "Export-linked costs", "APEDA assistance (being checked)"],
      ]
        .map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
        .join("") +
      "</tbody></table>",
    p(
      "These are combinations to assess, not a promise. Each scheme's own rules decide whether it applies to your unit and whether it can sit beside another. We map which scheme could pay for which part before you apply.",
    ),

    h(2, "Watch out: where food projects lose the subsidy"),
    p("Where food projects lose the subsidy."),
    ul([
      li("Machinery ordered before the route is fixed.", "Some schemes only count costs after a set step, and a purchase can't be made eligible later."),
      li(
        "Claiming overlapping support where the rules don't allow it.",
        "Where a scheme's rules don't allow it, support claimed on the same cost can be asked back later.",
      ),
      li(
        "A headline percentage with a low cap.",
        "A high rate with a low ceiling can pay less than a smaller rate without one. Read the cap before you compare.",
      ),
    ]),

    h(2, "One report"),
    p("The bank, the scheme and the approvals, on one report."),
    ul([
      li("The bank asks:", "can the project repay?"),
      li("The scheme asks:", "which costs qualify, and from when?"),
      li("The approvals ask:", "is the site, building and process allowed? CLU · CTE and CTO · FSSAI · Fire NOC · Factory licence"),
    ]),
    p("Three separate worlds. A report written for one of them can fail the other two."),

    h(2, "Questions food business owners ask"),
    `<p><strong>What subsidies can a food processing unit get in Haryana?</strong> Depending on the product, the place and the dates: capital support, interest support on the loan, state benefits under Haryana's 2026 policy, and help with testing, safety and certification. The first check helps identify which routes are worth assessing for your unit.</p>`,

    h(2, "Discuss your requirement"),
    p("Planning a mill, dairy or food plant? Get your benefits mapped before you order machinery."),

    h(2, "Sources and review"),
    p("The people behind this guidance. Author: Rapid Consulting editorial team."),
    ul([
      "PMFME, Ministry of Food Processing Industries",
      "CEFPPC operational guidelines, amendments, MoFPI",
      "Agriculture Infrastructure Fund guidelines, September 2024",
      "FSSAI licensing and registration (FoSCoS)",
      "Haryana Progressive MSME &amp; Export Promotion Policy 2026, Gazette, 29 July 2026",
    ]),
  ].join("\n"),
};

// ── Scheme: Agriculture Infrastructure Fund ──────────────────────────────────

const steps = [
  {
    title: "Check the fit",
    bring: "What the unit will handle, where, its capacity and rough cost",
    does: "Checks the activity, the applicant and the costs against the scheme. Free, in writing",
  },
  { title: "One project report", bring: "Land papers, quotations, how you'll fund it", does: "Writes one report that works for the bank and the scheme" },
  {
    title: "Bank sanction",
    bring: "Your KYC and the bank's forms",
    does: "Takes the proposal to the bank and answers its queries",
    decides: "The bank",
  },
  { title: "Register under AIF", does: "Registers the project under AIF with your bank", decides: "The scheme" },
  {
    title: "Claim the subvention",
    bring: "Interest certificates when asked",
    does: "Coordinates with your lender on the subvention claim and the records it needs",
    decides: "The bank and the scheme",
  },
];

const scheme = {
  slug: "agricultural-infrastructure-fund-aif",
  description: p(
    "3% off the interest on up to ₹2 crore of your loan, for up to seven years, on a warehouse, cold store or primary processing unit. A project report written only for the bank can lose it.",
  ),
  ministry: "Central, Ministry of Agriculture and Farmers Welfare",
  assistance_type: "3% a year off your loan interest, for up to 7 years",
  relevant_activity: "Post-harvest infrastructure and primary processing",
  policy_period: "Runs to 2032-33",
  eligibility: [
    h(3, "Will AIF cover your project?"),
    ul([
      li("Warehouses and silos:", "Storage for farm produce."),
      li("Cold stores and cold chain:", "Cold storage and refrigerated handling for perishables."),
      li("Sorting, grading and packing:", "Pack houses and grading lines."),
      li("Primary processing:", "Including secondary processing in the same project."),
    ]),
    p("Not covered:"),
    ul(["Secondary processing on its own", "Storage or processing that doesn't handle farm produce"]),
    h(3, "Who can apply, and on what conditions."),
    p("Who can apply:"),
    ul([
      "Farmers",
      "Farmer producer organisations, and their federations",
      "Cooperatives and primary agricultural credit societies",
      "Agri-entrepreneurs and start-ups",
      "Self-help groups and their federations",
      "State agencies and APMCs",
    ]),
    p("Conditions:"),
    ul([
      "A bank or eligible lender finances the project",
      "You put in at least 10% of the project cost",
      "The asset handles farm produce",
      "The activity is on the scheme's list",
    ]),
    p("Doesn't qualify:"),
    ul([
      "Secondary processing on its own",
      "The subvention on the part of a loan above ₹2 crore",
      "Storage or processing not linked to farm produce",
    ]),
  ].join("\n"),
  benefits: [
    h(3, "What 3% is worth on your loan."),
    p(
      "The scheme pays 3 points of your loan's interest each year, for up to seven years. You pay the rest of the interest and the whole principal. On a bigger loan, the 3% is worked out on ₹2 crore.",
    ),
    p("Illustrative: ₹2 crore term loan at a 9% interest rate, for a year, before any repayment."),
    ul([
      "Interest for the year: ₹18 lakh",
      "The scheme pays: ₹6 lakh (3%)",
      "You pay: ₹12 lakh (6%)",
    ]),
    p("As you repay, the loan, the interest and the scheme's share all fall, year by year, for up to seven years."),
    p(
      "Illustrative, worked out for a year on the full ₹2 crore before repayments. Your bank's rate and repayment schedule set the real figures.",
    ),
    h(3, "What if the bank says yes and the scheme says no?"),
    ul([
      li(
        "A report written only for the bank.",
        'The bank checks whether you can repay. The scheme checks whether the activity is on its list. Describe the unit as "food processing" and it can pass the first check and fail the second.',
      ),
      li("Secondary processing on its own.", "It's excluded. It qualifies only as part of a project that includes primary processing."),
      li(
        "The same cost under two schemes.",
        "AIF can sit beside a capital subsidy, but each scheme's rules decide whether a cost can count twice. Settle which scheme pays for which part before you apply.",
      ),
    ]),
  ].join("\n"),
  application_process: [
    h(3, "How an AIF loan comes together."),
    `<ol>${steps
      .map(
        (step) =>
          `<li><strong>${esc(step.title)}</strong>` +
          (step.bring ? `<br>You bring: ${esc(step.bring)}` : "") +
          (step.does ? `<br>Rapid does: ${esc(step.does)}` : "") +
          (step.decides ? `<br>Who decides: ${esc(step.decides)}` : "") +
          "</li>",
      )
      .join("")}</ol>`,
  ].join("\n"),
};

const run = async (sequelize, transaction, table, slug, values) => {
  const keys = Object.keys(values);
  const sets = keys.map((key) => `"${key}" = :${key}`).join(", ");
  const [, meta] = await sequelize.query(`UPDATE "${table}" SET ${sets}, "updated_at" = :now WHERE slug = :slug`, {
    replacements: { ...values, slug, now: new Date() },
    transaction,
  });
  const count = meta?.rowCount ?? meta;
  console.log(count ? `✅ ${table} ${slug}: Figma text written` : `⚠️  ${table} ${slug} not found; skipped`);
};

export async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;
  await sequelize.transaction(async (transaction) => {
    const { slug: industrySlug, ...industryValues } = industry;
    await run(sequelize, transaction, "industries", industrySlug, industryValues);
    const { slug: schemeSlug, ...schemeValues } = scheme;
    await run(sequelize, transaction, "schemes", schemeSlug, schemeValues);
  });
}

export async function down() {
  console.log("⚠️  Nothing restored: the earlier text of these records is not kept by this seeder");
}
