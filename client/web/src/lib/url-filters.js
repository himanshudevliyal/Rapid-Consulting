// Filters that live in the address (?industry=…&topic=…&q=…).
//
// The address is the single source of truth for a filtered view: an incoming
// link (an industry page, a profile, a FAQ link) selects its filters, every
// change writes them back, and the browser's Back/Forward buttons restore the
// previous selection. A fresh open of the plain address is always the
// default, unfiltered view - nothing is remembered between visits.
//
// Filtered views are never indexable (see useNoindex in hooks/use-url-filters).

/** Stable, URL-safe key of a label ("Exports & market access" -> "exports-market-access"). */
export const filterKey = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

const first = (value) => (Array.isArray(value) ? value[0] : value);

/** { key: "value" } for the given keys from a query string ("?a=1&b=2"). */
export function readSearch(search, keys) {
  const params = new URLSearchParams(search || "");
  return Object.fromEntries(keys.map((key) => [key, (params.get(key) ?? "").trim()]));
}

/** The same from a Next.js `searchParams` object (values may be arrays). */
export function pickParams(searchParams, keys) {
  const source = searchParams && typeof searchParams === "object" ? searchParams : {};
  return Object.fromEntries(
    keys.map((key) => [key, typeof first(source[key]) === "string" ? first(source[key]).trim() : ""]),
  );
}

export const sameValues = (a, b, keys) => keys.every((key) => (a?.[key] ?? "") === (b?.[key] ?? ""));

export const hasValues = (values, keys) => keys.some((key) => Boolean(values?.[key]));

/**
 * Writes the filter values into the address, leaving every other parameter and
 * the hash alone. `replace` rewrites the current history entry (typing in the
 * search box); otherwise a new entry is added so Back returns to the previous
 * selection. Nothing happens when the address would not change.
 */
export function writeSearch(values, keys, { replace = false } = {}) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  keys.forEach((key) => {
    const value = values?.[key];
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  const next = url.pathname + url.search + url.hash;
  const current = window.location.pathname + window.location.search + window.location.hash;
  if (next === current) return;
  window.history[replace ? "replaceState" : "pushState"](null, "", next);
}

/**
 * Which option a link's parameter names: the option's value, its key or its
 * label. Returns the option's value, or "" when nothing matches (an unknown
 * value never leaves the view in a state the controls cannot show).
 * options: [{ value, label }]
 */
export function resolveOption(param, options = []) {
  const wanted = filterKey(first(param));
  if (!wanted) return "";
  const hit = options.find(
    (option) =>
      option.value === first(param) ||
      filterKey(option.value) === wanted ||
      filterKey(option.label) === wanted,
  );
  return hit ? hit.value : "";
}
