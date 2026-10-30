import { WhatsAppButton } from "@/components/contact/whatsapp";
import { VideoPlaceholder } from "@/components/common/video-placeholder";
import { Html } from "@/components/common/html";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { cn } from "@/lib/utils";
import { asText, hasHtml, videoSource } from "@/lib/content/site-page-adapters";
import { HeroHighlights, highlightsOf } from "./hub-hero";
import { BlockShell, H1_CLASS } from "./shared";

// The "content" variant of the masthead (situation pages such as "Setting up a
// new unit"): the label, the page's one <h1>, the introduction, up to three icon
// rows, the buttons and a footnote on the left; on the right a white "Watch
// instead of reading" video card. The card shows when the masthead has a video
// title or a video link. With a title and no link, the shared video placeholder
// shows, labelled as a placeholder. The enquiry form is the page's side rail
// (see page-rail.jsx), not part of this block.

function VideoCard({ data, ctx, id }) {
  const { tx } = ctx;
  const label = asText(data.video_label) || tx("videoCardLabel", "Watch instead of reading");
  const title = asText(data.video_title);
  const meta = asText(data.video_meta);
  const text = asText(data.video_text);
  const source = videoSource(data.video_url);

  // The shared placeholder takes its three texts from a translator: give it ours.
  const placeholderText = (key) =>
    ({
      "service.videoTitle": title,
      "service.videoLabel": tx("videoPlaceholderLabel", "Placeholder - video to be supplied by Rapid"),
      "service.videoCaption": tx("videoPlaceholderCaption", "Read the full explanation below."),
    })[key] ?? "";

  return (
    <aside
      aria-labelledby={id}
      className="min-w-0 self-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(9,38,62,0.55)] sm:p-6"
    >
      <p id={id} className="wc2-eyebrow !m-0">
        {label}
      </p>
      <div className="mt-4 [&_.video-placeholder]:m-0 [&_.video-placeholder]:max-w-none [&_.video-placeholder]:overflow-hidden [&_.video-placeholder]:rounded-2xl">
        {source?.kind === "embed" && (
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
            <iframe
              src={source.src}
              title={title || label}
              loading="lazy"
              className="size-full border-0"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
        {source?.kind === "file" && (
          <video controls preload="none" className="aspect-video w-full rounded-2xl bg-black" aria-label={title || label}>
            <source src={source.src} />
          </video>
        )}
        {source?.kind === "link" && (
          <a
            href={source.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center rounded-full border border-[#09263e]/25 px-5 text-sm font-semibold !text-[#09263e]"
          >
            {tx("watchVideo", "Watch the video")} <span aria-hidden="true">↗</span>
          </a>
        )}
        {!source && <VideoPlaceholder t={placeholderText} />}
      </div>
      {meta && <p className="!m-0 !mt-3 !text-xs !font-semibold !uppercase !tracking-[0.08em] !text-slate-600">{meta}</p>}
      {title && source && <p className="!m-0 !mt-1 !text-base !font-semibold !leading-snug !text-[#09263e]">{title}</p>}
      {text && <p className="!m-0 !mt-1 !text-sm !leading-6 !text-slate-600">{text}</p>}
    </aside>
  );
}

export function ContentHero({ section, ctx, heading, ctaClass }) {
  const data = section.data;
  const { page } = ctx;
  const titleId = `${section.anchor}-title`;
  const videoId = `${section.anchor}-video`;
  const eyebrow = asText(data.eyebrow);
  const cta = asText(data.primary_cta_label);
  const showWhatsapp = data.show_whatsapp === true || data.show_whatsapp === "true";
  const footnote = asText(data.footnote);
  const hasVideo = Boolean(asText(data.video_title) || asText(data.video_url));

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} className="bg-[#eef3f0] !pb-10 !pt-8 md:!pb-14 md:!pt-12">
      <div className={cn("grid items-start gap-10", hasVideo && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14")}>
        <div className="min-w-0">
          {eyebrow && <p className="wc2-eyebrow !m-0">{eyebrow}</p>}
          <h1 id={titleId} className={cn(H1_CLASS, "!max-w-[24ch] !text-[clamp(32px,3.6vw,46px)]", eyebrow && "!mt-3")}>
            {heading}
          </h1>
          {hasHtml(data.intro_html) && (
            <Html html={data.intro_html} className="mt-5 max-w-[56ch] !text-[17px] !leading-8 text-slate-700" />
          )}
          <HeroHighlights items={highlightsOf(data)} />
          {(cta || showWhatsapp) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {cta && (
                <EnquiryTrigger className={ctaClass} source="page-hero" pageTitle={page.h1}>
                  {cta}
                  <span aria-hidden="true">→</span>
                </EnquiryTrigger>
              )}
              {showWhatsapp && <WhatsAppButton />}
            </div>
          )}
          {footnote && <p className="!m-0 !mt-5 max-w-[56ch] !text-xs !leading-5 !text-slate-600">{footnote}</p>}
        </div>
        {hasVideo && <VideoCard data={data} ctx={ctx} id={videoId} />}
      </div>
    </BlockShell>
  );
}
