import { rows, text as str } from "@/lib/content/managed-text";

// The Home page's managed text (page "home") as a map of the view's own text
// keys (homeA.*) -> managed text. Only supplied (non-empty) fields appear, so
// the view keeps its built-in wording for everything else (see overlayText).
// Pieces that are not a plain key (numbers, review cards, FAQ rows, tab lists)
// are read by their components from the section data.

const set = (map, key, value) => {
  const text = str(value);
  if (text) map[key] = text;
};

export function homeOverlay(get) {
  const own = {};
  const hero = get("hero");
  if (hero) {
    set(own, "homeA.hero.eyebrow", hero.eyebrow);
    set(own, "homeA.hero.title", hero.heading);
    set(own, "homeA.hero.sub", hero.intro);
    set(own, "homeA.hero.footnote", hero.footnote);
    ["support", "success", "ontime"].forEach((id, index) => {
      const bullet = rows(hero.bullets)[index];
      set(own, `homeA.hero.rows.${id}.title`, bullet?.title);
      set(own, `homeA.hero.rows.${id}.text`, bullet?.text);
    });
    // "95% / SUCCESS RATE": the slash starts the second line of the badge.
    const [value, ...label] = str(hero.badge_text).split("/").map((part) => part.trim());
    if (value && label.length) {
      set(own, "homeA.seal.value", value);
      set(own, "homeA.seal.label", label.join(" "));
      set(own, "homeA.seal.aria", `${value} ${label.join(" ")}`);
    }
    set(own, "homeA.form.eyebrow", hero.card_eyebrow);
    set(own, "homeA.form.title", hero.card_title);
    set(own, "homeA.form.hint", hero.card_text);
    const tabs = rows(hero.form_tabs);
    set(own, "homeA.form.tabApproval", tabs[0]?.label);
    set(own, "homeA.form.tabSubsidy", tabs[1]?.label);
    set(own, "homeA.form.submitApproval", tabs[0]?.submit_label || hero.submit_label);
    set(own, "homeA.form.submitSubsidy", tabs[1]?.submit_label);
    set(own, "homeA.form.name", hero.name_label);
    set(own, "homeA.form.phone", hero.phone_label);
    set(own, "homeA.form.district", hero.district_label);
    set(own, "homeA.form.districtPlaceholder", hero.district_placeholder);
    set(own, "homeA.form.site", hero.location_label);
    set(own, "homeA.form.activity", hero.activity_label);
    set(own, "homeA.form.activityPlaceholder", hero.activity_placeholder);
    set(own, "homeA.form.optional", hero.optional_label);
    set(own, "homeA.form.consent", hero.consent_label);
    set(own, "homeA.form.consentHelp", hero.form_error);
  }

  const numbers = get("numbers");
  if (numbers) {
    set(own, "homeA.numbers.title", numbers.heading);
    ["years", "projects", "businesses"].forEach((id, index) => set(own, `homeA.numbers.${id}`, rows(numbers.items)[index]?.label));
    set(own, "homeA.numbers.disbursed", numbers.panel_label);
  }

  const services = get("services");
  if (services) {
    set(own, "homeA.services.eyebrow", services.eyebrow);
    set(own, "homeA.services.title", services.heading);
    set(own, "homeA.services.intro", services.intro);
    set(own, "homeA.services.also", services.footer_text);
    set(own, "homeA.services.viewAll", services.footer_cta_label);
    // Tab 1 / 2 / 3 = Approvals / Subsidies / Finance (the website's own tab kinds).
    ["approvals", "subsidies", "finance"].forEach((kind, index) => {
      const tab = rows(services.tabs)[index];
      set(own, `homeA.services.${kind}.title`, tab?.title);
      set(own, `homeA.services.${kind}.blurb`, tab?.text);
      set(own, `homeA.services.${kind}.cta`, tab?.cta_label);
    });
  }

  const project = get("your-project");
  if (project) {
    set(own, "homeA.project.eyebrow", project.eyebrow);
    set(own, "homeA.project.title", project.heading);
    set(own, "homeA.project.intro", project.intro);
    set(own, "homeA.project.helps", rows(project.tabs).map((tab) => str(tab.note_label)).find(Boolean));
  }

  const cases = get("client-success");
  if (cases) {
    set(own, "homeA.cases.eyebrow", cases.eyebrow);
    set(own, "homeA.cases.title", cases.heading);
    set(own, "homeA.cases.intro", cases.intro);
    const item = rows(cases.items)[0];
    set(own, "homeA.cases.cta", item?.cta_label);
    set(own, "homeA.cases.label", item?.panel_label);
  }

  const approach = get("approach");
  if (approach) {
    set(own, "homeA.approach.eyebrow", approach.eyebrow);
    set(own, "homeA.approach.title", approach.heading);
    set(own, "homeA.approach.bold", approach.subheading);
    set(own, "homeA.approach.text", approach.text);
    set(own, "homeA.approach.learn", approach.primary_label);
    set(own, "homeA.approach.discuss", approach.secondary_label);
  }

  const industries = get("industries");
  if (industries) {
    set(own, "homeA.industries.eyebrow", industries.eyebrow);
    set(own, "homeA.industries.title", industries.heading);
    set(own, "homeA.industries.viewAll", industries.cta_label);
    set(own, "homeA.industries.explore", rows(industries.items)[0]?.cta_label);
    set(own, "homeA.industries.show", rows(industries.items)[1]?.cta_label);
  }

  const insights = get("insights");
  if (insights) {
    set(own, "homeA.insights.eyebrow", insights.eyebrow);
    set(own, "homeA.insights.title", insights.heading);
    set(own, "homeA.insights.intro", insights.intro);
    ["articles", "guides", "reports"].forEach((id, index) => set(own, `homeA.insights.${id}`, rows(insights.filters)[index]?.text));
    set(own, "homeA.insights.viewArticles", insights.cta_label);
  }

  const faqs = get("faqs");
  if (faqs) {
    set(own, "homeA.faq.eyebrow", faqs.eyebrow);
    set(own, "homeA.faq.title", faqs.heading);
    set(own, "homeA.faq.intro", faqs.intro);
  }
  return own;
}

