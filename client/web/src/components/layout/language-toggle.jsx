"use client";

import { useLocale, useTranslations } from "next-intl";

import { LOCALE_COOKIE } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTx } from "@/lib/use-tx";
import { useLanguageLinks } from "./language-switcher";

const remember = (locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
};

// The plain-text language toggle of the main bar: it shows the OTHER language
// ("Hindi" on an English page, "English" on a Hindi page) and is a real link,
// so it works without a menu. A page that has no Hindi version links to the
// English page with the usual notice (same rule as the language menu).
export function LanguageToggle({ services, dark = false, className, ...props }) {
  const locale = useLocale();
  const t = useTranslations();
  const tx = useTx();
  const links = useLanguageLinks(services);
  const other = links.find((link) => link.locale !== locale);
  if (!other) return null;

  const label = other.locale === "hi" ? tx("hdr.langHindi", "Hindi") : tx("language.en", "English");
  const unavailable = !other.available ? t("language.hindiUnavailable") : undefined;

  return (
    <a
      href={other.href}
      hrefLang={other.locale}
      title={unavailable}
      aria-label={`${t("language.label")}: ${label}${unavailable ? `. ${unavailable}` : ""}`}
      onClick={() => remember(other.locale)}
      className={cn(
        "h-10 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-[14px] font-medium leading-none underline-offset-[6px] transition-colors hover:underline",
        "focus-visible:outline-none focus-visible:ring-2",
        dark ? "text-white! hover:text-[#eaff6b]! focus-visible:ring-[#eaff6b]" : "text-[#09263e]! hover:text-[#1f5d57]! focus-visible:ring-[#1f5d57]",
        className,
      )}
      {...props}
    >
      {label}
    </a>
  );
}
