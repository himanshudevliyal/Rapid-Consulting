import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale, locales } from "@/i18n/routing";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { SessionDetail } from "@/components/pages/session-detail";
import { loadSessionDetail, loadSessionSlugs } from "@/lib/content/site-data";
import { absoluteUrl } from "@/lib/site";
import { copy } from "@/lib/pages/w4-copy";
import { sessionEndsAt } from "@/lib/pages/session-format";
import { standaloneMetadata } from "@/lib/pages/w4-meta";

// Session pages: the published session from the API (cached; the admin panel
// refreshes the page the moment it is saved). Unknown or hidden -> 404.
export const dynamicParams = true;

export async function generateStaticParams() {
  let slugs = [];
  try {
    slugs = await loadSessionSlugs();
  } catch {
    // API unreachable at build time: pages are then built on first visit.
    return [];
  }
  return locales.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const session = await loadSessionDetail(slug);
  if (!session) return { robots: { index: false, follow: false } };
  const t = await getTranslations({ locale });
  return standaloneMetadata({
    locale,
    path: `/sessions/${slug}`,
    title: session.title,
    description: session.description || copy(t, "sessions.meta.description"),
    siteName: t("meta.siteName"),
  });
}

// Event data only for a session that has not happened and can still be joined.
function eventJsonLd(session, locale, siteName) {
  if (session.state !== "upcoming" || !session.startsAt) return null;
  const end = sessionEndsAt(session.startsAt, session.durationMinutes);
  if (end && end.getTime() < Date.now()) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: session.title,
    description: session.description || undefined,
    startDate: session.startsAt,
    endDate: end ? end.toISOString() : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    url: absoluteUrl(`/${locale}/sessions/${session.slug}`),
    performer: session.speaker ? { "@type": "Person", name: session.speaker } : undefined,
    organizer: { "@type": "Organization", name: siteName },
  };
}

export default async function SessionDetailRoute({ params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const session = await loadSessionDetail(slug);
  if (!session) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const path = `/sessions/${slug}`;
  const sessionsLabel = copy(t, "sessions.heading");
  const jsonLd = eventJsonLd(session, locale, t("meta.siteName"));

  return (
    <>
      <PageAlternates en={`/en${path}`} hi={`/hi${path}`} />
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs
        heading={session.title}
        items={[
          { label: t("common.home"), href: `/${locale}` },
          { label: sessionsLabel, href: `/${locale}/sessions` },
          { label: session.title, href: `/${locale}${path}` },
        ]}
        backgroundImage="/assets/hero-section.jpg"
      />
      <SessionDetail session={session} locale={locale} t={t} />
    </>
  );
}
