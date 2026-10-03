// True only when the current language itself has the message - not the
// English fallback filled in by i18n/request.js. Used to mark links to pages
// that are only available in English ("(English)").
//   const t = useTranslations();            // or await getTranslations({ locale })
//   const has = hasTranslation(t);
//   has("pages.R02") -> false in Hindi
export function hasTranslation(t) {
  const untranslated = new Set(t.raw("untranslated") ?? []);
  return (key) => t.has(key) && !untranslated.has(key);
}
