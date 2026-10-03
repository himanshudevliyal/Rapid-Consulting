import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

// Messages that a language doesn't have yet fall back to English. The keys
// that fell back are listed in `untranslated`, so the site can still tell a
// real translation from a fallback (see i18n/has-translation.js).
function withFallback(messages, fallback, prefix = "", missing = []) {
  const result = { ...fallback };
  for (const [key, value] of Object.entries(fallback)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const own = messages?.[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = withFallback(own ?? {}, value, path, missing);
    } else if (own === undefined) {
      missing.push(path);
    } else {
      result[key] = own;
    }
  }
  return prefix ? result : { ...result, untranslated: missing };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const fallback = (await import(`../../messages/${routing.defaultLocale}.json`)).default;

  return {
    locale,
    messages: withFallback(messages, fallback),
  };
});
