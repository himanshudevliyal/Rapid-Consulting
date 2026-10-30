import { ArrowRight } from "lucide-react";

import { articleToSummary } from "@/lib/content/adapters";
import { hasTranslation } from "@/i18n/has-translation";
import { cachedFor } from "@/utils/api-helpers";
import { ARTICLES_TAG, fetchAllArticles, fetchArticles } from "@/services/article-service";
import { ContentCard } from "./content-card";

const LATEST = 3;

const ROLES = {
  written: { field: "author", param: "author_id" },
  reviewed: { field: "reviewer", param: "reviewer_id" },
};

// The person's latest items in one role, and how many there are in all.
// Uses the server's public article filters (?author_id= / ?reviewer_id=) when
// the person's id is known and the server honoured them; otherwise filters the
// full published list here, so the result is right either way.
async function latestFor({ slug, id }, role, limit) {
  const { field, param } = ROLES[role];
  const mine = (item) => item[field]?.slug === slug;

  if (id) {
    try {
      const page = await fetchArticles({ [param]: id, limit }, cachedFor(ARTICLES_TAG));
      const items = page.items.map(articleToSummary);
      if (items.every(mine)) return { items, total: page.total ?? items.length };
    } catch {
      // fall back to the full list below
    }
  }

  const all = await fetchAllArticles({}, cachedFor(ARTICLES_TAG)).catch(() => ({ items: [] }));
  const items = all.items.map(articleToSummary).filter(mine);
  return { items: items.slice(0, limit), total: items.length };
}

/**
 * Profile-style lists: the latest three items a person wrote and the latest
 * three they reviewed, each with a link to the full matching collection
 * (/resources?person=<slug>&role=written|reviewed). A role with nothing in it
 * renders nothing - no empty headings, no invented relationships.
 *
 *   person: { slug, id? }  (id = the team member's record id, when known, for
 *   the server-side filter)
 */
export async function PersonResources({ person, locale, t, limit = LATEST, headingLevel: Heading = "h2" }) {
  if (!person?.slug) return null;
  const has = hasTranslation(t);
  const [written, reviewed] = await Promise.all([
    latestFor(person, "written", limit),
    latestFor(person, "reviewed", limit),
  ]);

  const block = (role, { items, total }) =>
    items.length > 0 && (
      <section key={role} aria-labelledby={`person-${role}-title`} className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Heading id={`person-${role}-title`} className="!m-0 !text-2xl !font-semibold !tracking-tight !text-[#071f33]">
            {t(`wc.person.${role}`)}
          </Heading>
          <a
            href={`/${locale}/resources?person=${encodeURIComponent(person.slug)}${role === "reviewed" ? "&role=reviewed" : ""}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f5d57] transition-colors hover:text-[#09263e]"
          >
            {t("wc.person.seeAll", { count: total })}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-6 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="h-full">
              <ContentCard page={item} locale={locale} t={t} has={has} />
            </div>
          ))}
        </div>
      </section>
    );

  return (
    <div data-component="PersonResources">
      {block("written", written)}
      {block("reviewed", reviewed)}
    </div>
  );
}
