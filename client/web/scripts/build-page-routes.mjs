// Builds src/lib/data/page-routes.json: content identity -> public URL path
// (without the /{locale} prefix). Slugs reuse the page's earlier
// rapidconsulting.in URL where one exists (keeps search traffic); other
// pages get a slug from their English title. Run again after adding pages:
//   node scripts/build-page-routes.mjs <path>/website/content/manifest.json
import fs from "node:fs";
import path from "node:path";

const manifestPath = process.argv[2] ?? "../src/website/content/manifest.json";
const pages = JSON.parse(fs.readFileSync(manifestPath, "utf8")).pages.filter((p) => p.language === "en");

// Section landing pages and single pages with agreed, readable paths.
const FIXED = {
  H01: "",
  S00: "/services",
  I00: "/industries",
  R00: "/resources",
  R01: "/articles",
  R02: "/schemes",
  W00: "/case-studies",
  A03: "/about",
  A01: "/about",
  A02: "/how-we-work",
  C01: "/contact",
  U01: "/advisers",
  U02: "/careers",
  U03: "/careers/how-we-hire",
  P02: "/privacy-notice",
};

const PREFIX = {
  service: "/services",
  "service-family": "/services",
  "additional-service": "/services",
  industry: "/industries",
  scheme: "/schemes",
  article: "/articles",
  guide: "/guides",
  "case-study": "/case-studies",
  person: "/team",
  job: "/careers",
};

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const legacySlug = (page) => {
  const url = (page.original_urls ?? []).find((u) => u.includes("rapidconsulting.in"));
  return url ? new URL(url).pathname.split("/").filter(Boolean).pop() : null;
};

const routes = {};
const taken = new Set();
for (const page of pages) {
  let route = FIXED[page.id];
  if (route === undefined) {
    const prefix = PREFIX[page.page_type] ?? "";
    let slug = legacySlug(page) ?? slugify(page.title);
    if (taken.has(`${prefix}/${slug}`)) slug = slugify(page.title);
    if (taken.has(`${prefix}/${slug}`)) slug = `${slug}-${page.id.toLowerCase()}`;
    route = `${prefix}/${slug}`;
  }
  if (taken.has(route)) throw new Error(`Duplicate route ${route} (${page.id})`);
  taken.add(route);
  routes[page.id] = route;
}
routes.D064 = routes.D065; // manuscript alias

const out = path.resolve("src/lib/data/page-routes.json");
fs.writeFileSync(out, JSON.stringify(routes, null, 2) + "\n");
console.log(`Wrote ${Object.keys(routes).length} routes to ${out}`);
