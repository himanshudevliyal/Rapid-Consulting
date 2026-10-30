import { locales } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/site";
import { languageAlternates, robots } from "@/lib/seo";

const ogLocale = { en: "en_IN", hi: "hi_IN" };

// Metadata for the standalone pages (report, sessions) that are not built
// from the manuscripts. `available` lists the languages that really exist.
export function standaloneMetadata({ locale, path, title, description, siteName, available = locales }) {
  const url = absoluteUrl(`/${locale}${path}`);
  const full = title.includes(siteName) ? title : `${title} | ${siteName}`;
  return {
    title: { absolute: full },
    description,
    alternates: { canonical: url, languages: languageAlternates(path, available) },
    openGraph: {
      type: "website",
      url,
      title: full,
      description,
      siteName,
      locale: ogLocale[locale],
      alternateLocale: available.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
    twitter: { card: "summary", title: full, description },
    robots,
  };
}
