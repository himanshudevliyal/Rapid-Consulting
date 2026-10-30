import { homeSectionRole } from "@/lib/pages/presentation";
import { homeText } from "@/lib/pages/home-copy";
import { CaseCardsBlock } from "@/components/site-pages/managed-blocks";
import { siteText } from "@/components/site-pages/site-text";
import { ApproachSection } from "./approach-section";
import { HomeFaq } from "./home-faq";
import { IndustriesSection } from "./industries-section";
import { LogoStrip } from "./logo-strip";
import { NumbersStrip } from "./numbers-strip";
import { ProjectChooser } from "./project-chooser";
import { ProofSection } from "./proof-section";
import { ResourcesSection } from "./resources-section";
import { ReviewsSection } from "./reviews-section";
import { ServicesSection } from "./services-section-server";
import placeholders from "@/lib/data/home-placeholders.json";
import { first, localHref, rows, text as str } from "@/lib/content/managed-text";

const SITUATIONS = ["land", "machinery", "newUnit", "running", "fileStuck", "claimStuck"];

/**
 * The Home sequence after the hero (Figma 519-3479, Option A), in this order:
 * numbers, services, your project, client success, client experiences, logos,
 * the Rapid approach, industries, insights and resources, FAQ. The order lives
 * here, not in the copy. The closing enquiry panel is the footer's.
 *
 * Server component: the services, case studies, industries, articles and guides
 * load their records from the API themselves. `page.sections` (the home page
 * content) still supplies the approach, industries and FAQ headings so the
 * approved Hindi text is kept.
 *
 * `managed` (the managed page "home", or null) supplies the text; `text` already
 * answers from it (see HomeView). With a managed page a section the page does not
 * list (hidden in the admin panel) is not drawn.
 */
export function HomeSections({ page, t, has, text: given, managed = null }) {
  const locale = page.locale;
  const text = given ?? homeText(t, has, locale);
  const get = (key) => managed?.get(key) ?? null;
  const show = (key) => !managed || Boolean(managed.byKey[key]);
  const sectionOf = (role) => page.sections.find((section) => homeSectionRole(section) === role);

  // "Your project": the managed tabs in order; a field a tab leaves empty keeps the built-in
  // wording of the situation at the same position.
  const projectTabs = rows(get("your-project")?.tabs);
  const situationIds = projectTabs.length ? projectTabs.map((_, index) => SITUATIONS[index] ?? `situation-${index + 1}`) : SITUATIONS;
  const situations = situationIds.map((id, index) => {
    const tab = projectTabs[index] ?? {};
    const known = SITUATIONS.includes(id);
    const own = (key) => (known ? text(`homeA.project.situations.${id}.${key}`) : "");
    const chips = rows(tab.chips).map((chip) => str(chip.text)).filter(Boolean);
    return {
      id,
      label: first(tab.label, own("label"), `${index + 1}`),
      title: first(tab.title, own("title"), tab.label),
      questions: chips.length ? chips : known ? [1, 2, 3].map((n) => own(`q${n}`)) : [],
      helps: first(tab.note_text, own("helps")),
      warning: first(tab.callout, own("warning")),
      cta: first(tab.cta_label, own("cta"), text("homeA.project.situations.land.cta")),
    };
  });

  const clients = get("clients");
  const logoCount = Number(clients?.count) >= 3 ? Math.min(Math.round(Number(clients.count)), 12) : placeholders.logos.count;
  const logoTiles = Array.from({ length: logoCount }, (_, index) =>
    text("homeA.logos.item", { n: String(index + 1).padStart(2, "0") }),
  );

  return (
    <div className="home-sections">
      {show("numbers") && <NumbersStrip text={text} data={get("numbers")} />}
      {show("services") && <ServicesSection page={page} text={text} t={t} data={get("services")} />}
      {show("your-project") && (
      <ProjectChooser
        eyebrow={text("homeA.project.eyebrow")}
        title={text("homeA.project.title")}
        intro={text("homeA.project.intro")}
        listLabel={text("homeA.project.listLabel")}
        questionsLabel={text("homeA.project.questions")}
        helpsLabel={text("homeA.project.helps")}
        situations={situations}
      />
      )}
      {show("client-success") && (
        <ProofSection
          text={text}
          ctaLabel={get("client-success")?.cta_label}
          ctaHref={localHref(get("client-success")?.cta_href, locale)}
          fallback={
            managed?.byKey["client-success"] ? (
              <CaseCardsBlock
                section={managed.byKey["client-success"]}
                ctx={{ page: managed.page, locale, t, tx: siteText(t), has, records: {}, topic: "", stages: [], inColumn: false, tone: "plain" }}
              />
            ) : null
          }
        />
      )}
      {show("reviews") && <ReviewsSection text={text} data={get("reviews")} />}
      {show("clients") && (
      <LogoStrip
        eyebrow={str(clients?.eyebrow)}
        title={first(clients?.heading, text("homeA.logos.title"))}
        tiles={logoTiles}
        note={placeholders.logos.placeholder ? text("homeA.logos.placeholder") : ""}
        pauseLabel={text("homeA.logos.pause")}
        playLabel={text("homeA.logos.play")}
      />
      )}
      {show("approach") && (
        <ApproachSection
          text={text}
          title={managed ? undefined : sectionOf("approach")?.title}
          locale={locale}
          learnHref={localHref(get("approach")?.primary_href, locale)}
        />
      )}
      {show("industries") && (
        <IndustriesSection
          text={text}
          title={managed ? text("homeA.industries.title") : sectionOf("industries")?.title || text("homeA.industries.title")}
          locale={locale}
          viewAllHref={localHref(get("industries")?.cta_href, locale)}
        />
      )}
      {show("insights") && (
        <ResourcesSection text={text} t={t} has={has} locale={locale} articlesHref={localHref(get("insights")?.cta_href, locale)} />
      )}
      {show("faqs") && <HomeFaq text={text} faqSection={sectionOf("faq")} locale={locale} data={get("faqs")} />}
    </div>
  );
}
