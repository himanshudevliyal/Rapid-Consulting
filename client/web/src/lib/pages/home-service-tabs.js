// Home page service selector: which tab each service category belongs to.
//
// The tabs are Approvals (family S02), Subsidies and incentives (S01) and
// Finance and insurance (S04 + S05, one tab). Any other category the API
// returns (for example Licences and certifications, S03) keeps its own tab
// after those three; a tab only exists when the API has data for it.

const FAMILY_TYPE = "service-family";

export const TAB_FOR_CODE = { S02: "approvals", S01: "subsidies", S04: "finance", S05: "finance" };
export const TAB_ORDER = ["approvals", "subsidies", "finance"];

// One category -> one or more "sets": the services filed under one family
// code, with that family's overview page when the category holds it. A
// category that mixes families (S04 and S05 together, or an S03 service next to
// an S04 one) is split by the services' own family code, so each service lands
// on the tab of its family.
function setsOf(category) {
  const services = category.services ?? [];
  const families = services.filter((service) => service.type === FAMILY_TYPE);
  const rest = services.filter((service) => service.type !== FAMILY_TYPE);
  if (!families.length && !rest.length) return [];

  const codes = [...new Set([...families.map((family) => family.code), ...rest.map((service) => service.family_code)].filter(Boolean))];
  if (codes.length <= 1) {
    return [
      {
        code: codes[0] ?? "",
        family: families[0] ?? null,
        title: category.title,
        slug: category.slug,
        services: rest,
      },
    ];
  }

  return codes.map((code, index) => ({
    code,
    family: families.find((family) => family.code === code) ?? null,
    title: category.title,
    slug: `${category.slug}-${code}`,
    // Services without a known family stay with the first one.
    services: rest.filter((service) => (codes.includes(service.family_code) ? service.family_code === code : index === 0)),
  }));
}

/**
 * Raw categories ([{ id, title, slug, services }] from GET /services/categories)
 * -> tabs in display order: [{ key, kind, sets: [{ code, family, services, title, slug }] }]
 * `kind` is "approvals" | "subsidies" | "finance" | "other".
 */
export function buildServiceTabs(categories = []) {
  const tabs = new Map();
  categories.flatMap(setsOf).forEach((set) => {
    const kind = TAB_FOR_CODE[set.code] ?? "other";
    const key = kind === "other" ? `other-${set.slug}` : kind;
    const tab = tabs.get(key) ?? { key, kind, sets: [] };
    tab.sets.push(set);
    tabs.set(key, tab);
  });

  const rank = (tab) => (tab.kind === "other" ? TAB_ORDER.length : TAB_ORDER.indexOf(tab.kind));
  return [...tabs.values()].sort((a, b) => rank(a) - rank(b));
}
