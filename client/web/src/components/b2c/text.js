// Copy for the scheme / guide / article / case-study pages lives under the
// `b2c` namespace (messages/_additions/b2c.{en,hi}.json). Until those files
// are merged into messages/en.json a key is simply missing, so every lookup
// carries its English fallback and the pages read correctly either way.
//
//   const tx = b2cText(t);                          // t from getTranslations
//   tx("scheme.glanceTitle", "{name} at a glance", { name: "AIF" })
const fill = (text, values) =>
  values ? String(text).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole)) : text;

export const b2cText = (t) => (key, fallback, values) => {
  const full = `b2c.${key}`;
  try {
    if (t?.has?.(full)) return t(full, values);
  } catch {
    // fall through to the English fallback
  }
  return fill(fallback, values);
};

// Shared class strings.
export const LIME_BUTTON =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-6 py-2.5 text-sm font-semibold text-[#09263e] no-underline transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

export const OUTLINE_BUTTON =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#09263e]/40 bg-white px-6 py-2.5 text-sm font-semibold text-[#09263e] no-underline transition-colors hover:bg-[#eef3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

// Page title in the masthead (the global stylesheet styles bare h1: `!` wins).
export const H1 =
  "!m-0 !text-[clamp(32px,3.6vw,46px)] !font-semibold !leading-[1.14] !tracking-[-0.035em] !text-[#09263e]";

export const H2 =
  "!m-0 !text-[clamp(24px,2.4vw,30px)] !font-semibold !leading-[1.25] !tracking-[-0.02em] !text-[#09263e]";

// The API only accepts lowercase letters, digits and hyphens (max 60) as the
// enquiry source.
export const enquirySource = (prefix, slug) =>
  `${prefix}-${slug}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
