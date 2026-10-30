// Server Component: loads the service categories (and, for the subsidy tab, the
// reviewed scheme catalogue) from the API, then passes only plain serialisable
// data to the Client Component. The tab logic (lib/pages/home-service-tabs.js)
// is unchanged: Approvals, Subsidies and incentives, Finance and insurance, plus
// any other category the API returns.
import { buildServiceTabs } from "@/lib/pages/home-service-tabs";
import { loadFeaturedSchemes } from "@/lib/content/site-data";
import { fetchServiceCategories } from "@/services/service-service";
import { mainSiteHref, serviceHref } from "@/lib/site";
import { localHref, rows, text as str } from "@/lib/content/managed-text";
import { ServicesTabUI } from "./services-section";

// The single catch-all "Scheme Directory" item is replaced by named entries.
const isDirectoryItem = (service) =>
  /scheme-directory|scheme-?index/i.test(service.slug ?? "") ||
  /scheme directory|स्कीम डायरेक्टरी|योजना निर्देशिका/i.test(service.title ?? "");

const SUBSIDY_ENTRIES = 6;

// Fallback one-line hints for approval cards whose service has no short
// description of its own (the service's description, edited in the admin panel,
// always comes first). First matching rule wins.
const HINT_RULES = [
  [/fire/i, "fire"],
  [/building|plan approval/i, "building"],
  [/consent to establish|\bcte\b/i, "cte"],
  [/consent to operate|\bcto\b/i, "cto"],
  [/land use|\bclu\b|change[- ]of[- ]land/i, "clu"],
  [/land|plot|site/i, "land"],
];

// Tab 1 / 2 / 3 of the managed "services" block = Approvals / Subsidies / Finance.
const MANAGED_TAB = { approvals: 0, subsidies: 1, finance: 2 };
const norm = (value) => String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

// `data` is the managed "services" block (or undefined): its tab label replaces the tab's
// name, and its card lines (text + hint) replace the hint of the card with the same title.
// The cards themselves are the live services and schemes; the page's own cards are shown
// only for a tab that has none.
export async function ServicesSection({ page, text, t, data }) {
  const locale = page.locale;
  const [categories, schemes] = await Promise.all([
    fetchServiceCategories(locale).catch(() => []),
    loadFeaturedSchemes({ limit: SUBSIDY_ENTRIES }),
  ]);
  const tabs = buildServiceTabs(categories);
  // The curated subsidy tab (named schemes, advisory, viability report) stays
  // even when no category is filed under the subsidy family.
  if (!tabs.some((tab) => tab.kind === "subsidies") && schemes.length) {
    const at = tabs.findIndex((tab) => tab.kind === "approvals") + 1;
    tabs.splice(at, 0, {
      key: "subsidies",
      kind: "subsidies",
      sets: [{ code: "S01", family: null, services: [], title: "", slug: "subsidies" }],
    });
  }

  const hintFor = (service) => {
    const own = (service.short_description ?? "").replace(/<[^>]*>/g, "").trim();
    if (own) return own;
    const subject = `${service.title ?? ""} ${service.slug ?? ""}`;
    const rule = HINT_RULES.find(([pattern]) => pattern.test(subject));
    return rule ? text(`homeA.services.hints.${rule[1]}`) : "";
  };

  const serviceCard = (service, extra = {}) => ({
    id: service.slug,
    title: service.title,
    href: serviceHref(service, locale),
    locale: service.has_locale ? locale : "en",
    icon: service.icon,
    hint: hintFor(service),
    ...extra,
  });

  // A set: its overview (family) page first, then its services.
  const setCards = (set) => [...(set.family ? [set.family] : []), ...set.services].map((service) => serviceCard(service));

  // The three fixed tabs use the site's own names; any other category keeps the
  // name it has in the API.
  const managedFamily = (family, kind) => {
    const managedTab = rows(data?.tabs)[MANAGED_TAB[kind]];
    if (!managedTab) return family;
    const own = rows(managedTab.cards).filter((card) => str(card.title));
    let cards = family.cards;
    if (own.length && !cards.length) {
      cards = own.map((card, index) => ({
        id: `managed-${index}`,
        title: str(card.title),
        href: localHref(card.href, locale, `/${locale}/services`),
        locale,
        icon: "file-text",
        hint: `${str(card.text)} ${str(card.hint)}`.trim(),
      }));
    } else if (own.length) {
      cards = cards.map((card) => {
        const match = own.find((item) => norm(item.title) === norm(card.title));
        const hint = match ? `${str(match.text)} ${str(match.hint)}`.trim() : "";
        return hint ? { ...card, hint } : card;
      });
    }
    return { ...family, label: str(managedTab.label) || family.label, cards };
  };

  const tabTitle = (tab) => (tab.kind === "other" ? tab.sets[0]?.title : t(`wc.homeTabs.${tab.kind}`));

  const families = tabs.map((tab) => {
    const label = tabTitle(tab);
    const copyKey = tab.kind === "other" ? "other" : tab.kind;
    const panel = {
      title: tab.kind === "other" ? label : text(`homeA.services.${copyKey}.title`),
      blurb: text(`homeA.services.${copyKey}.blurb`),
      cta: text(`homeA.services.${copyKey}.cta`),
      source: text(`homeA.services.${copyKey}.source`),
    };

    if (tab.kind === "subsidies") {
      // Named schemes (each opens its own scheme page), then Rapid's advisory,
      // the all-schemes route and the viability report.
      const set = tab.sets[0];
      const cards = [
        ...schemes.map((scheme) => ({
          id: `scheme-${scheme.slug}`,
          title: scheme.title,
          href: scheme.href,
          locale: "en",
          icon: scheme.icon,
          hint: scheme.facts?.assistanceType || scheme.ministry || "",
        })),
        ...(set.family ? [serviceCard(set.family, { id: "overview", title: text("homeA.services.overview") })] : []),
        ...set.services.filter((service) => !isDirectoryItem(service)).map((service) => serviceCard(service)),
        { id: "all-schemes", title: text("homeA.services.allSchemes"), href: mainSiteHref("R02", locale, false), locale: "en", icon: "list-checks" },
        {
          id: "subsidy-viability-report",
          title: text("homeA.services.report"),
          href: `/${locale}/subsidy-viability-report`,
          locale,
          icon: "chart-line-up",
        },
      ];
      return managedFamily({ id: tab.key, label, ...panel, cards, note: text("homeA.services.note") }, tab.kind);
    }

    // Approvals, Finance and insurance (S04 + S05) and any other category.
    return managedFamily({ id: tab.key, label, ...panel, cards: tab.sets.flatMap(setCards) }, tab.kind);
  });

  return (
    <ServicesTabUI
      sectionId="services"
      eyebrow={text("homeA.services.eyebrow")}
      title={text("homeA.services.title")}
      intro={text("homeA.services.intro")}
      locale={locale}
      englishSuffix={t("common.englishSuffix")}
      tabsLabel={t("wc.homeTabs.label")}
      families={families}
      carouselLabel={text("homeA.services.carousel")}
      previous={text("homeA.services.previous")}
      next={text("homeA.services.next")}
      alsoText={text("homeA.services.also")}
      viewAllLabel={text("homeA.services.viewAll")}
      viewAllHref={localHref(data?.footer_cta_href, locale, `/${locale}/services`)}
      emptyText={locale === "hi" ? "कोई सेवा उपलब्ध नहीं" : "No services listed."}
    />
  );
}
