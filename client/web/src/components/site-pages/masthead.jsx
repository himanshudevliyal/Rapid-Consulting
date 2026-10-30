import { WhatsAppButton } from "@/components/contact/whatsapp";
import { Html } from "@/components/common/html";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { asText, hasHtml, imageUrl } from "@/lib/content/site-page-adapters";
import { ContentHero } from "./content-hero";
import { HubHero } from "./hub-hero";
import { BlockShell, EYEBROW, H1_CLASS } from "./shared";

export const CTA_BUTTON =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-6 py-2.5 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

// The heading the page carries as its single <h1>.
export const mastheadHeading = (section, page) => asText(section?.data?.heading) || page.h1 || page.title;

// Opening block of a page: eyebrow, the page's one <h1>, introduction, the
// primary call to action and WhatsApp. Variants: default | split (picture beside the text)
// | hero (hub pages: highlights and a "choose where you are" card, see hub-hero.jsx)
// | content (situation pages: highlights and a video card, see content-hero.jsx).
export function MastheadBlock({ section, ctx }) {
  if (section.variant === "hero") {
    return <HubHero section={section} ctx={ctx} heading={mastheadHeading(section, ctx.page)} ctaClass={CTA_BUTTON} />;
  }
  if (section.variant === "content") {
    return <ContentHero section={section} ctx={ctx} heading={mastheadHeading(section, ctx.page)} ctaClass={CTA_BUTTON} />;
  }
  const data = section.data;
  const { page, tx } = ctx;
  const titleId = `${section.anchor}-title`;
  const eyebrow = asText(data.eyebrow);
  const cta = asText(data.primary_cta_label);
  const src = imageUrl(data.image);
  const alt = asText(data.image_alt);
  const split = section.variant === "split";
  const showWhatsapp = data.show_whatsapp === true || data.show_whatsapp === "true";

  const text = (
    <div className="min-w-0">
      {eyebrow && <span className={EYEBROW}>{eyebrow}</span>}
      <h1 id={titleId} className={H1_CLASS}>
        {mastheadHeading(section, page)}
      </h1>
      {hasHtml(data.intro_html) && (
        <Html html={data.intro_html} className="mt-5 max-w-[62ch] !text-[17px] !leading-8 text-slate-700" />
      )}
      {(cta || showWhatsapp) && (
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {cta && (
            <EnquiryTrigger className={CTA_BUTTON} source="page-hero" pageTitle={page.h1}>
              {cta}
              <span aria-hidden="true">↗</span>
            </EnquiryTrigger>
          )}
          {showWhatsapp && <WhatsAppButton />}
        </div>
      )}
    </div>
  );

  const picture = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={split ? "aspect-[4/3] w-full rounded-2xl border border-slate-200 object-cover" : "aspect-[21/9] w-full rounded-2xl border border-slate-200 object-cover"}
    />
  ) : (
    <ImagePlaceholder
      ratio="4/3"
      className="rounded-2xl"
      label={tx("imagePlaceholder", "Placeholder image - final photography to be supplied by Rapid")}
    />
  );

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} className="!pb-10 !pt-10 md:!pt-12">
      {split ? (
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-12">
          {text}
          {picture}
        </div>
      ) : (
        <>
          {text}
          {src && <div className="mt-8">{picture}</div>}
        </>
      )}
    </BlockShell>
  );
}

export const mastheadEmpty = () => false;
