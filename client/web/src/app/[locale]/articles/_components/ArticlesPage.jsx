/**
 * ArticlesPage - collection view for the Articles / Guides index (R01).
 *
 * Isolated from all other collection pages. Changing this layout,
 * cards, or filters has ZERO effect on Schemes, Services, Case Studies
 * or Industries. /guides renders this page too (opened on Guides).
 *
 * Light restyle to the Figma look: sage hero, the Resources explorer, the
 * page's guidance copy, the client ticker and the closing enquiry panel.
 */

import Image from "next/image";

import { ClientTicker } from "@/components/common/client-ticker";
import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { GuidanceSections, HeroActions, HeroBand } from "@/components/pages/b2d-parts";
import { b2dText } from "@/lib/pages/b2d-text";
import { enquiryCard } from "@/lib/pages/b2d-forms";
import { linksApiContent } from "@/lib/pages/card-copy";
import { ArticlesDirectory } from "./ArticlesDirectory";

/**
 * Articles and guides come from the API (ArticlesDirectory); `initialData` is
 * the list the server already fetched.
 */
export function ArticlesPage({ page, t, image = "/assets/articles.jpg", initialData, defaultFormat = "article" }) {
  const tx = b2dText(t);
  // Sections of the index copy that only list individual guides / articles are
  // replaced by the live directory below; the rest is guidance.
  const guidanceSections = page.sections.filter((section) => !linksApiContent(section.html));

  return (
    <>
      <HeroBand
        titleId="articles-title"
        eyebrow={t(defaultFormat === "guide" ? "wc.resources.eyebrowGuides" : "wc.resources.eyebrowArticles")}
        title={page.h1}
        introHtml={page.introHtml}
        actions={<HeroActions label={t("service.discussProject")} source="articles-hero" pageTitle={page.h1} />}
        card={
          <Image
            width={600}
            height={420}
            src={page.image || image}
            alt=""
            className="hidden h-auto w-full rounded-3xl border border-slate-200 object-cover lg:block"
          />
        }
      />

      <ArticlesDirectory initialData={initialData} defaultFormat={defaultFormat} />

      <GuidanceSections sections={guidanceSections} />

      <ClientTicker />

      <ClosingEnquiryPanel
        id="articles-closing"
        heading={tx("articles.closing.heading", "Tell us your question.")}
        intro={tx("articles.closing.intro", "Ask in your own words. A Rapid expert will reply with the next step.")}
        photoNote={tx("form.photoNote", "Placeholder: a factory site in Haryana. Final photography to be supplied by Rapid.")}
        card={enquiryCard(tx, {
          title: tx("articles.closing.cardTitle", "Tell us your question."),
          source: defaultFormat === "guide" ? "guides-index" : "articles-index",
          pageId: page.id,
          pageTitle: page.h1,
          serviceName: tx("articles.closing.service", "Question"),
          submit: tx("articles.closing.submit", "Send my question"),
          activityLabel: tx("articles.closing.activity", "Your question"),
          select: null,
        })}
      />
    </>
  );
}
