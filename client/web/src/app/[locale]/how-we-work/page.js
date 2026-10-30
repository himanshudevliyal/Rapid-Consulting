import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { HowWeWorkView } from "./_components/HowWeWorkView";
import { resolveContentPath } from "@/lib/pages/resolve";
import { first, loadManaged, paragraphs, text as str, withManagedMeta } from "@/lib/content/managed-text";

const PATH = "/how-we-work";

const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The manuscript page with the managed page's text laid over it: the hero's
// heading and introduction and the rich-text sections (heading + html), in the
// page's order. Anything the managed page leaves empty keeps the manuscript's.
function withManagedText(page, managed) {
  if (!managed) return page;
  const hero = managed.get("hero") ?? {};
  const sections = managed.list
    .filter((section) => section.type === "rich_text" && str(section.data.heading) && str(section.data.html))
    .map((section) => ({ id: section.anchor, title: str(section.data.heading), html: section.data.html }));
  const intro = paragraphs(hero.intro).map((part) => `<p>${escapeHtml(part)}</p>`).join("");
  return {
    ...page,
    title: first(managed.page.title, page.title),
    h1: first(hero.heading, managed.page.h1, page.h1),
    introHtml: intro || page.introHtml,
    sections: sections.length ? sections : page.sections,
  };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const [t, managed] = await Promise.all([getTranslations({ locale }), loadManaged("how-we-work", locale)]);
  return withManagedMeta(contentPageMetadata(withManagedText(found.page, managed), locale, t("meta.siteName"), PATH), managed);
}

export default async function HowWeWorkRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const [t, managed] = await Promise.all([getTranslations({ locale }), loadManaged("how-we-work", locale)]);
  return (
    <>
      <PageAlternates en={`/en${PATH}`} hi={found.page.hasHindi ? `/hi${PATH}` : null} />
      <HowWeWorkView page={withManagedText(found.page, managed)} t={t} />
    </>
  );
}
