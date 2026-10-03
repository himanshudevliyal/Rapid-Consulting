import { defineRouting } from "next-intl/routing";

/**
 * Central routing configuration for the website's languages.
 *
 * - Every URL carries its language: /en/services/..., /hi/services/...
 * - "/" and paths without a language (/services/zed-certification) are
 *   redirected to the visitor's saved language (NEXT_LOCALE cookie), else the
 *   browser's preferred language, else English.
 *
 * Add a language here and in messages/ - every other part of the i18n setup
 * (proxy, request config, language switcher, hreflang) reads from this file.
 */
export const routing = defineRouting({
  locales: ["en", "hi"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const { locales, defaultLocale } = routing;
export const LOCALE_COOKIE = routing.localeCookie.name;

export const isLocale = (value) => locales.includes(value);

// Open Graph / hreflang language tags.
export const localeTags = { en: "en-IN", hi: "hi-IN" };
