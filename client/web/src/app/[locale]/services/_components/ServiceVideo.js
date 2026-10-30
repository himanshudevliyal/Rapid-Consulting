import { Play } from "lucide-react";

import { b2bText } from "@/lib/pages/b2b-text";
import { videoOf } from "./service-model";

// "Watch instead of reading": a card with a play tile, the video's title and a
// line about it. When the service record has a video it links to it; until then
// the card is a clearly labelled placeholder (nothing is played, nothing links).
export function ServiceVideo({ service, t }) {
  const tx = b2bText(t);
  const video = videoOf(service);
  const live = Boolean(video?.url);
  const title = video?.title || t("service.videoTitle");
  const blurb = video?.description || (live ? "" : tx("video.placeholder", "Video placeholder. The final video is supplied by Rapid; the full explanation is written below."));

  const body = (
    <>
      <span
        className="b2b-video__tile"
        aria-hidden="true"
        style={video?.poster ? { backgroundImage: `linear-gradient(rgba(9,38,63,.28), rgba(9,38,63,.28)), url("${String(video.poster).replace(/[\"()]/g, encodeURIComponent)}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <span className="b2b-video__play">
          <Play className="size-6 fill-current" />
        </span>
        <span className="b2b-video__meta">{video?.duration || (live ? "" : tx("video.soon", "Video coming"))}</span>
      </span>
      <span className="b2b-video__text">
        <span className="b2b-eyebrow">{tx("video.label", "Watch instead of reading")}</span>
        <strong>{title}</strong>
        {blurb && <span>{blurb}</span>}
        {!live && <em>{tx("video.tag", "Placeholder")}</em>}
      </span>
    </>
  );

  return (
    <figure className="b2b-video" data-component="ServiceVideo" data-placeholder={live ? undefined : "true"}>
      {live ? (
        <a className="b2b-video__card" href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`${title} (${tx("video.newTab", "opens YouTube in a new tab")})`}>
          {body}
        </a>
      ) : (
        <div className="b2b-video__card">{body}</div>
      )}
    </figure>
  );
}
