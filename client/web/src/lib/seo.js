import { localeTags, locales, defaultLocale } from "@/i18n/routing";
import { ALLOW_INDEXING, SITE_URL, absoluteUrl, PHONE_LABEL } from "./site";
import { plainText } from "./content";
import { getFileUrl } from "@/utils/file-url";

const DEFAULT_IMAGE = "/assets/rapid-logo-original.png";

export const robots = ALLOW_INDEXING
  ? { index: true, follow: true }
  : { index: false, follow: false };

const ogLocale = (locale) => localeTags[locale].replace("-", "_");

// Service pictures / og images are files saved by the API (NEXT_PUBLIC_FILE_BASE).
const resolveImage = (value) => {
  const url = getFileUrl(value);
  if (!url) return absoluteUrl(DEFAULT_IMAGE);
  return /^https?:\/\//.test(url) ? url : absoluteUrl(url);
};

// hreflang: only languages that really exist for this page, plus x-default.
export function languageAlternates(path, availableLocales = locales) {
  const languages = Object.fromEntries(
    availableLocales.map((locale) => [localeTags[locale], absoluteUrl(`/${locale}${path}`)]),
  );
  languages["x-default"] = absoluteUrl(`/${defaultLocale}${path}`);
  return languages;
}

export function serviceMetadata(service, locale, siteName) {
  const path = `/services/${service.slug}`;
  const url = absoluteUrl(`/${locale}${path}`);
  const title = service.meta_title || `${service.title} | ${siteName}`;
  const description = service.meta_description || service.short_description || undefined;

  return {
    title: { absolute: title },
    description,
    keywords: service.meta_keywords || undefined,
    alternates: {
      canonical: url,
      languages: languageAlternates(path, service.available_locales),
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName,
      locale: ogLocale(locale),
      alternateLocale: service.available_locales.filter((l) => l !== locale).map(ogLocale),
      images: [{ url: resolveImage(service.og_image || service.pictures?.[0]) }],
    },
    twitter: { card: "summary", title, description },
    robots,
  };
}

export function servicesIndexMetadata(page, locale, t) {
  const title = page?.meta_title || t("meta.servicesTitle");
  const description = page?.meta_description || page?.short_description || t("meta.defaultDescription");
  const url = absoluteUrl(`/${locale}/services`);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates("/services", page?.available_locales ?? [defaultLocale]),
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: t("meta.siteName"),
      locale: ogLocale(locale),
      images: [{ url: resolveImage() }],
    },
    robots,
  };
}

// Truthful structured data: the service itself, its breadcrumb trail and
// the FAQ questions that are actually on the page.
export function serviceJsonLd(service, locale, { homeLabel, servicesLabel }) {
  const url = absoluteUrl(`/${locale}/services/${service.slug}`);
  const graph = [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.h1 || service.title,
      description: service.meta_description || service.short_description,
      url,
      inLanguage: localeTags[service.locale],
      areaServed: { "@type": "State", name: "Haryana" },
      provider: {
        "@type": "Organization",
        name: "Rapid Consulting",
        url: SITE_URL,
        telephone: PHONE_LABEL,
        address: { "@type": "PostalAddress", addressLocality: "Hisar", addressRegion: "Haryana", addressCountry: "IN" },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: homeLabel, item: absoluteUrl(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: servicesLabel, item: absoluteUrl(`/${locale}/services`) },
        { "@type": "ListItem", position: 3, name: service.title, item: url },
      ],
    },
  ];

  const questions = (service.sections ?? [])
    .filter((section) => section.role === "faq")
    .flatMap((section) => section.items ?? []);
  if (questions.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: questions.map((item) => ({
        "@type": "Question",
        name: item.title,
        acceptedAnswer: { "@type": "Answer", text: plainText(item.html) },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

// Content pages (home, industries, schemes, articles, cases, about…) served
// from the compiled manuscripts at their slug URLs.
export function contentPageMetadata(page, locale, siteName, pathWithoutLocale) {
  const available = page.hasHindi ? locales : [defaultLocale];
  const url = absoluteUrl(`/${locale}${pathWithoutLocale}`);
  const title = page.metaTitle || (page.id === "H01" ? siteName : `${page.title} | ${siteName}`);
  const description = page.description || undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: languageAlternates(pathWithoutLocale, available) },
    openGraph: {
      type: ["article", "guide"].includes(page.type) ? "article" : "website",
      url,
      title,
      description,
      siteName,
      locale: ogLocale(locale),
      alternateLocale: available.filter((l) => l !== locale).map(ogLocale),
      images: [{ url: resolveImage() }],
    },
    twitter: { card: "summary", title, description },
    robots,
  };
}
