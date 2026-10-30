// Copy for the page-builder blocks lives under the `sitePages` namespace
// (messages/_additions/wa.*.json). Until those files are merged into
// messages/en.json a key is simply missing, so every lookup carries its
// English fallback and the blocks read correctly either way.
//
//   const tx = siteText(t);                         // t from getTranslations / useTranslations
//   tx("viewAll", "View all")                       // -> sitePages.viewAll
//   tx("stepLabel", "Step {n}", { n: 2 })           // -> "Step 2"
const fill = (text, values) =>
  values ? String(text).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole)) : text;

export const siteText = (t) => (key, fallback, values) => {
  const full = `sitePages.${key}`;
  try {
    if (t?.has?.(full)) return t(full, values);
  } catch {
    // fall through to the English fallback
  }
  return fill(fallback, values);
};
