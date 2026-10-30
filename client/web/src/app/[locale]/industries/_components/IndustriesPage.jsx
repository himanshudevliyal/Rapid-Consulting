/**
 * IndustriesPage — collection view for the Industries index page (I00).
 *
 * Isolated from all other collection pages. Industries has a special
 * "other industries" accordion section that no other collection needs —
 * it lives here, not in the shared CollectionView.
 *
 * Look: the same language as the industry pages — a light sage hero (rust
 * label, bold navy H1, lime action + WhatsApp, photo on the right), the
 * industries as white cards on a light band, and the guidance as navy-ruled
 * disclosures.
 */

import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

import { WhatsAppMark } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { ClientTicker } from "@/components/common/client-ticker";
import { LIME_BUTTON, OUTLINE_BUTTON } from "@/components/pages/b2b-buttons";
import { Html } from "@/components/pages/content-primitives";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { linksApiContent } from "@/lib/pages/card-copy";
import { b2bText } from "@/lib/pages/b2b-text";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER } from "@/lib/site";
import { IndustriesDirectory } from "./IndustriesDirectory";

export function IndustriesPage({
  page,
  t,
  has,
  initialData,
}) {
  const tx = b2bText(t);
  // ── Data ────────────────────────────────────────────────────────────────────
  // The industries come from the API (IndustriesDirectory). Sections of the
  // index copy that only describe individual industries are replaced by it;
  // the rest is guidance.
  const guidanceSections = page.sections.filter(
    (section) => !linksApiContent(section.html),
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="b2b-page b2b-industries collection-page">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="b2b-hubhero" aria-labelledby="industries-title">
        <div className="b2b-wrap b2b-hubhero__grid b2b-hubhero__grid--card">
          <div className="min-w-0">
            <p className="b2b-eyebrow">{tx("industries.eyebrow", "Industries")}</p>
            <h1 id="industries-title" className="b2b-h1 b2b-h1--hub">
              {page.h1}
            </h1>
            <Html html={page.introHtml} className="b2b-lead" />
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#all-industries" className={LIME_BUTTON}>
                {tx("industries.browse", "Find your industry")}
                <ChevronDown className="size-4" aria-hidden="true" />
              </a>
              <EnquiryTrigger className={OUTLINE_BUTTON} source="industries-hero" pageTitle={page.h1}>
                {t("service.discussProject")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </EnquiryTrigger>
              <a className={OUTLINE_BUTTON} href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${WHATSAPP_LABEL}`}>
                <span className="size-4 [&>svg]:size-4" aria-hidden="true">
                  <WhatsAppMark />
                </span>
                WhatsApp {WHATSAPP_LABEL}
              </a>
            </div>
          </div>
          <div className="min-w-0">
            {page.image ? (
              <Image
                width={640}
                height={480}
                src={page.image}
                alt=""
                className="h-auto w-full rounded-3xl object-cover"
              />
            ) : (
              <ImagePlaceholder
                ratio="4/3"
                label={t("detail.industry.photoPlaceholder")}
                className="rounded-3xl"
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Industries (from the API) ─────────────────────────────────────── */}
      <IndustriesDirectory initialData={initialData} />

      {/* ── Generic guidance accordion ────────────────────────────────────── */}
      {guidanceSections.length > 0 && (
        <section className="b2b-sec" aria-label={tx("industries.guidance", "Guidance")}>
          <div className="b2b-wrap max-w-4xl">
            {guidanceSections.map((s) => (
              <details key={s.id} id={s.id} className="b2b-details">
                <summary>
                  {s.title}
                  <span aria-hidden="true">+</span>
                </summary>
                <Html html={s.html} className="b2b-prose" />
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ── Client ticker ─────────────────────────────────────────────────── */}
      <ClientTicker />

      {/* Industries index intentionally omits the ContactExperience CTA
          (matching original CollectionView: page.id !== "I00" guard). */}
    </div>
  );
}
