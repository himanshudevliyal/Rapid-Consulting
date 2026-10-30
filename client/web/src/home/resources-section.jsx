import { SectionHeading } from "@/components/home/section-heading";
import { WRAP } from "@/components/home/styles";
import { ContentCard } from "@/components/pages/content-card";
import { ARTICLES_TAG, fetchArticles } from "@/services/article-service";
import { articleToSummary } from "@/lib/content/adapters";
import { loadGuides } from "@/lib/content/site-data";
import { cachedFor } from "@/utils/api-helpers";
import { ResourcesTabs } from "./resources-tabs";

const CARDS = 3;

// Articles and guides come from the API (admin panel -> Articles, type
// "article" or "guide"). Reports have no collection yet: that tab is disabled.
export async function ResourcesSection({ text, t, has, locale, articlesHref }) {
  const [articles, guides] = await Promise.all([
    fetchArticles({ type: "article", limit: CARDS }, cachedFor(ARTICLES_TAG))
      .then((result) => result.items.map(articleToSummary))
      .catch(() => []),
    loadGuides({ limit: CARDS }),
  ]);

  const cards = (items) =>
    items.length ? items.map((item) => <ContentCard key={item.id} page={item} locale={locale} t={t} has={has} />) : null;

  const tabs = [
    {
      id: "articles",
      label: text("homeA.insights.articles"),
      viewAllHref: articlesHref || `/${locale}/articles`,
      viewAllLabel: text("homeA.insights.viewArticles"),
    },
    {
      id: "guides",
      label: text("homeA.insights.guides"),
      viewAllHref: `/${locale}/guides`,
      viewAllLabel: text("homeA.insights.viewGuides"),
    },
    { id: "reports", label: text("homeA.insights.reports"), disabled: true, hint: text("homeA.insights.soon") },
  ];

  return (
    <section id="resources" aria-labelledby="home-insights-title" className="scroll-mt-24 bg-white py-12 sm:py-16 lg:py-20">
      <div className={WRAP}>
        <SectionHeading
          id="home-insights-title"
          eyebrow={text("homeA.insights.eyebrow")}
          title={text("homeA.insights.title")}
          intro={text("homeA.insights.intro")}
        />
        <div className="mt-8">
          <ResourcesTabs
            tabs={tabs}
            panels={{ articles: cards(articles), guides: cards(guides) }}
            tabsLabel={text("homeA.insights.tabsLabel")}
            emptyText={text("homeA.insights.empty")}
          />
        </div>
      </div>
    </section>
  );
}
