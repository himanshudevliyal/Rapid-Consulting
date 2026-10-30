// Copy for the batch-2 "b2d" pages (scheme directory, case archive, Resources
// hub, FAQ hub, articles index) lives under the `b2d` namespace
// (messages/_additions/b2d.{en,hi}.json). Until those files are merged into
// messages/en.json a key is simply missing, so every lookup carries its English
// fallback and the pages read correctly either way.
//
//   const tx = b2dText(t);                              // t: getTranslations() / useTranslations() (no namespace)
//   tx("schemes.hero.eyebrow", "Scheme directory")      // -> b2d.schemes.hero.eyebrow
//   tx("form.name", "Your name")
//
// Plurals are written as two keys (see `countText`), never as ICU plural
// syntax, so the English fallback and the merged message always agree.
const fill = (text, values) =>
  values ? String(text).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole)) : text;

export const b2dText = (t) => (key, fallback, values) => {
  const full = `b2d.${key}`;
  try {
    if (t?.has?.(full)) return values || !t.raw ? t(full, values) : t.raw(full); // no values: keep {placeholders} for the caller to fill
  } catch {
    // fall through to the English fallback
  }
  return fill(fallback, values);
};
