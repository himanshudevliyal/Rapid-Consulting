"use client";

import { usePathname } from "next/navigation";

import { useLocale, useTranslations } from "next-intl";
import { LOCALE_COOKIE, defaultLocale, locales } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAlternates } from "./page-alternates";

const remember = (locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
};

// Where each language version of the current page lives. A missing
// translation keeps the visitor on the English page with a notice, as in the
// prototype (never a page that pretends to be Hindi).
export function useLanguageLinks(services = []) {
  const pathname = usePathname() ?? `/${defaultLocale}`;
  const rest = pathname.replace(/^\/(en|hi)(?=\/|$)/, "");

  // Until the page reports its versions (after hydration), derive them from
  // the services list so the first paint already links correctly.
  const registered = useAlternates();
  const slug = rest.match(/^\/services\/([^/?#]+)/)?.[1];
  const service = slug && services.find((item) => item.slug === slug);
  const alternates =
    registered ??
    (service
      ? Object.fromEntries(
          locales.map((locale) => [
            locale,
            service.available_locales.includes(locale) ? `/${locale}/services/${service.slug}` : null,
          ]),
        )
      : null);

  return locales.map((locale) => {
    const own = alternates ? alternates[locale] : `/${locale}${rest}`;
    const available = Boolean(own);
    const english = alternates?.[defaultLocale] ?? `/${defaultLocale}${rest}`;
    return {
      locale,
      available,
      href: available ? own : `${english}?language=hi-unavailable`,
    };
  });
}

export function LanguageSwitcher({ services }) {
  const locale = useLocale();
  const t = useTranslations();
  const links = useLanguageLinks(services);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="language-menu-trigger header-language" aria-label={t("language.label")}>
        <span lang={locale === "hi" ? "en" : "hi"}>{t("language.switchTo")}</span>
        <span aria-hidden="true">⌄</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
        {links.map((link) => (
          <DropdownMenuItem key={link.locale} asChild className="language-menu-item">
            <a href={link.href} lang={link.locale} aria-current={link.locale === locale} onClick={() => remember(link.locale)}>
              <span>
                {t(`language.${link.locale}`)}
                {!link.available && <span className="language-menu-note">{t("language.hindiUnavailable")}</span>}
              </span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Plain link used inside the mobile navigation.
export function MobileLanguageLink({ services }) {
  const locale = useLocale();
  const t = useTranslations();
  const links = useLanguageLinks(services);
  const other = links.find((link) => link.locale !== locale);
  return (
    <a className="mobile-language" href={other.href} lang={other.locale} onClick={() => remember(other.locale)}>
      {t("language.switchTo")}
      {!other.available ? t("language.englishPageNote") : ""}
    </a>
  );
}
