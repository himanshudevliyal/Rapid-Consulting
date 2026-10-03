import { rewriteContentLinks } from "@/lib/page-routes";

export { Icon } from "@/components/common/icon";
import { Icon } from "@/components/common/icon";

// Trusted manuscript HTML. Identity links (/en/p/D066) become slug URLs here,
// at render time, so layout helpers can keep reading the identities.
export function Html({ html, className = "" }) {
  if (!html) return null;
  return <div className={`prose ${className}`} dangerouslySetInnerHTML={{ __html: rewriteContentLinks(html) }} />;
}

export function PhotoPlaceholder({ label, t, kind = "facility" }) {
  return (
    <figure className={`photo-placeholder photo-${kind}`}>
      <div className="photo-grid" aria-hidden="true" />
      <div className="photo-symbol">
        <Icon name={kind === "person" ? "users-three" : "image"} />
        <span>{label || t("site.photo.label")}</span>
        <small>{t("site.photo.small")}</small>
      </div>
      <figcaption>{t("site.photo.caption")}</figcaption>
    </figure>
  );
}

export function SectionNav({ sections, t }) {
  return (
    <nav className="section-nav" aria-label={t("service.onThisPageLabel")}>
      <span>{t("service.onThisPage")}</span>
      <div>
        {sections.map((section) => (
          <a href={`#${section.id}`} key={section.id}>
            {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function DownloadButton({ href, label }) {
  return (
    <a className="button button-secondary download-button" href={href} download>
      <svg  className="w-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6" />
      </svg>
      {label}
    </a>
  );
}
