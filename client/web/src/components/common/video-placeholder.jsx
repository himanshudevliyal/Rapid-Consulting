import { Icon } from "./icon";

export function VideoPlaceholder({ t }) {
  return (
    <figure className="video-placeholder">
      <div className="video-inner">
        <span className="video-circle" aria-hidden="true">
          <Icon name="play" />
        </span>
        <div>
          <strong>{t("service.videoTitle")}</strong>
          <span>{t("service.videoLabel")}</span>
        </div>
      </div>
      <figcaption>{t("service.videoCaption")}</figcaption>
    </figure>
  );
}
