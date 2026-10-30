import { Html } from "@/components/common/html";
import { getFileUrl } from "@/utils/file-url";

// "Will your land work for your unit? Three things decide it."
// The factors are the section's items (title + text). The picture above them
// (a plan, a diagram) is different for every service, so it is uploaded in the
// admin panel (section field `image`, with `image_alt`); without one only the
// numbered factors are shown.
export function ServiceEligibility({ section }) {
  const items = (section.items ?? []).filter((item) => item.title);
  const image = getFileUrl(section.image);

  return (
    <div className="b2b-elig" data-component="ServiceEligibility">
      <Html html={section.intro_html || section.html} className="b2b-prose" />
      <div className="b2b-elig__grid">
        {image && (
          <figure className="b2b-elig__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={section.image_alt || ""} className="b2b-elig__img" loading="lazy" decoding="async" />
          </figure>
        )}
        <ol className="b2b-elig__list">
          {items.map((item, index) => (
            <li key={item.key || index}>
              <span className="b2b-elig__num" aria-hidden="true">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3>{item.title}</h3>
                <Html html={item.html} className="b2b-prose" />
              </div>
            </li>
          ))}
        </ol>
      </div>
      <Html html={section.outro_html} className="b2b-prose" />
    </div>
  );
}
