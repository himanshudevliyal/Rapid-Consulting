import { LogoStrip } from "@/home/logo-strip";
import { homeText } from "@/lib/pages/home-copy";
import placeholders from "@/lib/data/home-placeholders.json";
import { asText } from "@/lib/content/site-page-adapters";
import { NAV_OFFSET } from "./shared";

// "Businesses that trust Rapid." The same scrolling row of grey placeholder
// tiles as the Home page (home/logo-strip.jsx): no brand names, decorative,
// pausable, still under prefers-reduced-motion. The count of tiles and the
// "placeholder" flag come from the block and lib/data/home-placeholders.json.

const DEFAULT_COUNT = 7;

const countOf = (data) => {
  const value = Number(data.count);
  return Number.isFinite(value) && value >= 3 ? Math.min(Math.round(value), 12) : DEFAULT_COUNT;
};

export function LogoStripBlock({ section, ctx }) {
  const { data } = section;
  const text = homeText(ctx.t, ctx.has, ctx.locale);
  const eyebrow = asText(data.eyebrow);
  const title = asText(data.heading) || text("homeA.logos.title");
  const tiles = Array.from({ length: countOf(data) }, (_, index) =>
    text("homeA.logos.item", { n: String(index + 1).padStart(2, "0") }),
  );

  return (
    <div id={section.anchor} data-block={section.type} className={`${NAV_OFFSET} bg-white`}>
      {eyebrow && (
        <p className="wc2-eyebrow !m-0 !block px-4 pt-8 text-center">
          {eyebrow}
        </p>
      )}
      <LogoStrip
        title={title}
        tiles={tiles}
        note={placeholders.logos.placeholder ? text("homeA.logos.placeholder") : ""}
      />
    </div>
  );
}

export const logoStripEmpty = () => false;
