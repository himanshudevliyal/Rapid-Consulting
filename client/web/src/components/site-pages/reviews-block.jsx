import { ReviewsSection } from "@/home/reviews-section";
import { homeText } from "@/lib/pages/home-copy";
import { asText } from "@/lib/content/site-page-adapters";
import { NAV_OFFSET } from "./shared";

// "Client experiences": the Home reviews carousel (home/reviews-section.jsx)
// as a block. The rating box and the review cards are the SAMPLE content of
// lib/data/home-placeholders.json, flagged on the page as placeholders until
// Rapid supplies verified reviews; the quotes, places and services the page
// supplies (items) replace the sample ones, and a name or business left empty
// keeps the sample placeholder; the rating box shows only once a real rating is filled in. "View all reviews" stays disabled until a
// reviews archive exists. The block's optional label / heading / intro replace
// the Home wording; leave them empty to keep it.

export function ReviewsBlock({ section, ctx }) {
  const { data } = section;
  const home = homeText(ctx.t, ctx.has, ctx.locale);
  const own = {
    "homeA.reviews.eyebrow": asText(data.eyebrow),
    "homeA.reviews.title": asText(data.heading),
    "homeA.reviews.intro": asText(data.intro),
  };
  const text = (key, values) => own[key] || home(key, values);

  return (
    <div id={section.anchor} data-block={section.type} className={NAV_OFFSET}>
      {/* Same vertical rhythm as the other blocks of a site page. */}
      <ReviewsSection text={text} data={data} padding="py-12 md:py-14" />
    </div>
  );
}

export const reviewsEmpty = () => false;
