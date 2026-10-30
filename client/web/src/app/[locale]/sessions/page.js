import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { PageAlternates } from "@/components/layout/page-alternates";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";
import { SessionCard } from "@/components/pages/session-card";
import { loadSessions } from "@/lib/content/site-data";
import { copy } from "@/lib/pages/w4-copy";
import { effectiveState } from "@/lib/pages/session-format";
import { standaloneMetadata } from "@/lib/pages/w4-meta";

const PATH = "/sessions";
const HERO_IMAGE = "/assets/hero-section.jpg";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return standaloneMetadata({
    locale,
    path: PATH,
    title: copy(t, "sessions.meta.title"),
    description: copy(t, "sessions.meta.description"),
    siteName: t("meta.siteName"),
  });
}

function SessionGroup({ id, heading, sessions, locale, t }) {
  if (!sessions.length) return null;
  return (
    <section aria-labelledby={id} className="mt-12 first:mt-0">
      <h2 id={id} className="mb-6 text-2xl font-semibold text-[#09263e]">
        {heading}
      </h2>
      <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 xl:grid-cols-3">
        {sessions.map((session) => (
          <li key={session.slug} className="min-w-0">
            <SessionCard session={session} locale={locale} t={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// Live sessions: upcoming first (soonest first), then past sessions and recordings.
export default async function SessionsRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const sessions = await loadSessions();
  const upcoming = sessions.filter((session) => effectiveState(session) === "upcoming");
  const past = sessions.filter((session) => effectiveState(session) !== "upcoming");
  const heading = copy(t, "sessions.heading");

  return (
    <>
      <PageAlternates en={`/en${PATH}`} hi={`/hi${PATH}`} />
      <Breadcrumbs
        heading={heading}
        items={[
          { label: t("common.home"), href: `/${locale}` },
          { label: heading, href: `/${locale}${PATH}` },
        ]}
        backgroundImage={HERO_IMAGE}
      />
      <main id="main">
        <Section className="py-12 lg:py-16" containerClassName="px-4 sm:px-6 lg:px-8">
          <Heading
            eyebrow={copy(t, "sessions.eyebrow")}
            heading={heading}
            subheading={copy(t, "sessions.intro")}
            className="mb-10 text-left"
            subheadingClassName="mt-3 max-w-2xl"
            headingClassName="text-[2.6rem] leading-[1.1] font-bold tracking-tight text-[#111] mt-0 text-wrap-balance lg:text-[3rem]"
          />

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#09263e]/25 bg-[#fafaf7] p-8 text-center">
              <h2 className="m-0 text-xl font-semibold text-[#09263e]">{copy(t, "sessions.emptyTitle")}</h2>
              <p className="mx-auto mt-2 mb-0 max-w-md text-slate-600">{copy(t, "sessions.emptyBody")}</p>
            </div>
          ) : (
            <>
              <SessionGroup
                id="sessions-upcoming"
                heading={copy(t, "sessions.upcoming")}
                sessions={upcoming}
                locale={locale}
                t={t}
              />
              <SessionGroup id="sessions-past" heading={copy(t, "sessions.past")} sessions={past} locale={locale} t={t} />
            </>
          )}
        </Section>
      </main>
    </>
  );
}
