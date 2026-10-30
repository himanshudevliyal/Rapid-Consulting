// Copy for the service page, the industry page and the industries index lives
// under the `b2b` namespace (messages/_additions/b2b.{en,hi}.json). Until those
// files are merged into messages/en.json a key is simply missing, so every
// lookup carries its English fallback and the pages read correctly either way.
//
//   const tx = b2bText(t);                            // t from getTranslations / useTranslations
//   tx("rail.submit", "Get my first review")          // -> b2b.rail.submit
//   tx("rail.title", "Get a review of {name}", { name })
const fill = (text, values) =>
  values ? String(text).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole)) : text;

export const b2bText = (t) => (key, fallback, values) => {
  const full = `b2b.${key}`;
  try {
    if (t?.has?.(full)) return t(full, values);
  } catch {
    // fall through to the English fallback
  }
  return fill(fallback, values);
};

// Plain text of a trusted HTML fragment (for short excerpts and labels).
export const textOf = (html = "") =>
  String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

// A short, whole-word excerpt ("...") of a longer text.
export const excerpt = (text = "", max = 120) => {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, "")}…`;
};
