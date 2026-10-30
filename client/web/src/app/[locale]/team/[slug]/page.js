import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { hasTranslation } from "@/i18n/has-translation";
import { PageAlternates } from "@/components/layout/page-alternates";
import { PageView } from "@/components/pages/page-view";
import { stripTags } from "@/lib/content/adapters";
import { loadCaseStudies, loadTeamProfile, loadTeamSlugs } from "@/lib/content/site-data";
import { resolveContentPath } from "@/lib/pages/resolve";
import { contentPageMetadata, robots } from "@/lib/seo";
import { TeamProfile } from "../_components/TeamProfile";
import { PersonResources } from "@/components/pages/person-resources";

// Team profile pages: the person record from the API (cached; the admin panel
// refreshes the page the moment it is saved). The people shown as authors and
// reviewers link here. Profiles that existed as written pages before the
// records did keep working; any other slug is a 404.
export const dynamicParams = true;

export async function generateStaticParams({ params }) {
  const { locale } = await params;
  if (locale !== defaultLocale) return [];
  return loadTeamSlugs();
}

// One lookup per request, shared by generateMetadata and the page.
const resolveProfile = cache(async (locale, slug) => {
  const path = `/team/${slug}`;
  if (locale === defaultLocale) {
    const person = await loadTeamProfile(slug);
    if (person) return { kind: "profile", person, path };
  }
  const written = resolveContentPath(locale, path);
  if (written.kind === "page") return { kind: "written", page: written.page, path };
  if (written.kind === "fallback") return { kind: "redirect", path: written.path };
  if (locale !== defaultLocale) {
    return { kind: "redirect", path: `/${defaultLocale}${path}?language=${locale}-unavailable` };
  }
  return { kind: "missing" };
});

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const found = await resolveProfile(locale, slug).catch(() => ({ kind: "missing" }));
  if (found.kind !== "profile" && found.kind !== "written") return { robots };
  const t = await getTranslations({ locale });
  if (found.kind === "written") {
    return contentPageMetadata(found.page, locale, t("meta.siteName"), found.path);
  }
  const { person } = found;
  const about = stripTags(person.bio).slice(0, 160);
  const description =
    about || [person.name, person.designation].filter(Boolean).join(", ") + ` - ${t("meta.siteName")}`;
  const metadata = contentPageMetadata(
    { ...person, description, hasHindi: false },
    locale,
    t("meta.siteName"),
    found.path,
  );
  // A stand-in profile is not worth indexing until its real content arrives.
  return person.placeholder ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

export default async function TeamProfileRoute({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const found = await resolveProfile(locale, slug);
  if (found.kind === "missing") notFound();
  if (found.kind === "redirect") redirect(found.path);

  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  if (found.kind === "written") {
    return (
      <>
        <PageAlternates en={`/en${found.path}`} hi={found.page.hasHindi ? `/hi${found.path}` : null} />
        <PageView page={found.page} t={t} has={hasTranslation(t)} />
      </>
    );
  }

  // Case studies this person wrote or reviewed (the case record's author / reviewer).
  const slugOf = found.person.slug;
  const cases = (await loadCaseStudies().catch(() => []))
    .filter((item) => item.author?.slug === slugOf || item.reviewer?.slug === slugOf)
    .slice(0, 4);

  return (
    <>
      <PageAlternates en={`/en${found.path}`} hi={null} />
      <TeamProfile person={found.person} locale={locale} t={t} cases={cases}>
        <PersonResources person={{ slug: found.person.slug, id: found.person.uuid }} locale={locale} t={t} />
      </TeamProfile>
    </>
  );
}
