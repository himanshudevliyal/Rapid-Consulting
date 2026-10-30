// Menu / home data built from the service categories API
// (GET /services/categories): each category with its services. A category's
// own "family" page (type service-family) becomes the heading link; every
// other service is listed under it. Assign a service to a category in the
// admin panel and it appears here, in the menu and on the home page.

const FAMILY = "service-family";

export function toCategoryGroups(categories = []) {
  return categories
    .map((category) => {
      const services = category.services ?? [];
      const family = services.find((service) => service.type === FAMILY) ?? null;
      const children = services.filter((service) => service.type !== FAMILY);
      return { id: category.id, title: category.title, slug: category.slug, family, services: children };
    })
    .filter((group) => group.family || group.services.length);
}

// ── Subsidies & Incentives gets its own top-level menu heading ──────────────
// The S01 service family (Subsidies & Incentives advisory) is promoted out of
// the Services menu. URLs and slugs are unchanged; only where the menu shows it.

export const SUBSIDY_FAMILY_CODE = "S01";

export const isSubsidyGroup = (group) => group?.family?.code === SUBSIDY_FAMILY_CODE;

// A listed service that belongs to the subsidy family (or is the family page).
export const isSubsidyService = (service) =>
  service?.code === SUBSIDY_FAMILY_CODE || service?.family_code === SUBSIDY_FAMILY_CODE;

// { subsidy: the S01 category group (or null), rest: every other group }
export function splitSubsidyGroups(groups = []) {
  return {
    subsidy: groups.find(isSubsidyGroup) ?? null,
    rest: groups.filter((group) => !isSubsidyGroup(group)),
  };
}

// ── Approvals menu ─────────────────────────────────────────────────────────
// Approvals lists the service categories EXCEPT the subsidy family (S01, its
// own menu) and the finance and insurance families (S04 / S05, their own
// overview page, reached from "Other business support").

export const FINANCE_FAMILY_CODES = ["S04", "S05"];
export const LICENCE_FAMILY_CODE = "S03";

export const isFinanceGroup = (group) => FINANCE_FAMILY_CODES.includes(group?.family?.code);

// A listed service that belongs to a finance / insurance family (or is one).
export const isFinanceService = (service) =>
  FINANCE_FAMILY_CODES.includes(service?.code) || FINANCE_FAMILY_CODES.includes(service?.family_code);

// The category groups shown in the Approvals menu.
export const approvalGroups = (groups = []) =>
  groups.filter((group) => !isSubsidyGroup(group) && !isFinanceGroup(group));

// Split `items` into at most `columns` runs (order kept) so that the tallest
// column is as short as possible. `weight(item)` is the item's height in rows.
// Used to balance the dense Services mega menu.
export function balanceColumns(items = [], columns = 3, weight = () => 1) {
  const list = items.filter(Boolean);
  const k = Math.max(1, Math.min(columns, list.length));
  if (k <= 1) return list.length ? [list] : [];

  const weights = list.map(weight);
  const prefix = [0];
  weights.forEach((w, i) => prefix.push(prefix[i] + w));
  const sum = (from, to) => prefix[to] - prefix[from];

  // best[c][i] = smallest possible tallest-column height for the first i items in c columns
  const best = Array.from({ length: k + 1 }, () => Array(list.length + 1).fill(Infinity));
  const cut = Array.from({ length: k + 1 }, () => Array(list.length + 1).fill(0));
  best[0][0] = 0;
  for (let c = 1; c <= k; c++) {
    for (let i = 1; i <= list.length; i++) {
      for (let j = c - 1; j < i; j++) {
        const height = Math.max(best[c - 1][j], sum(j, i));
        if (height < best[c][i]) {
          best[c][i] = height;
          cut[c][i] = j;
        }
      }
    }
  }

  const result = [];
  let end = list.length;
  for (let c = k; c >= 1; c--) {
    const start = cut[c][end];
    result.unshift(list.slice(start, end));
    end = start;
  }
  return result.filter((column) => column.length);
}
