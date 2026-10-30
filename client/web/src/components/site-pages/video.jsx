import { VideoPlaceholder } from "@/components/common/video-placeholder";
import { Html } from "@/components/common/html";
import { asText, hasHtml, videoSource } from "@/lib/content/site-page-adapters";
import { BlockHead, BlockShell, Plain } from "./shared";

// A video with its caption and a text transcript. With no video link yet, the
// shared (clearly labelled) video placeholder shows instead.
export function VideoBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const caption = asText(data.caption);
  const source = videoSource(data.video_url);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const label = heading || ctx.tx("videoLabel", "Video");

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label || label}>
      <BlockHead id={titleId} heading={heading} />
      {source?.kind === "embed" && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
          <iframe
            src={source.src}
            title={label}
            loading="lazy"
            className="size-full border-0"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
      {source?.kind === "file" && (
        <video
          controls
          preload="none"
          className="aspect-video w-full rounded-2xl border border-slate-200 bg-black"
          aria-label={label}
        >
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
          {ctx.tx("watchVideo", "Watch the video")} <span aria-hidden="true">↗</span>
        </a>
      )}
      {!source && <VideoPlaceholder t={ctx.t} />}
      {caption && source && <Plain className="mt-3 !text-sm">{caption}</Plain>}
      {hasHtml(data.transcript_html) && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#09263e]">
            {ctx.tx("transcript", "Transcript")}
          </summary>
          <Html html={data.transcript_html} className="mt-3 !text-[15px] !leading-7 text-slate-700" />
        </details>
      )}
    </BlockShell>
  );
}

export const videoEmpty = () => false;
