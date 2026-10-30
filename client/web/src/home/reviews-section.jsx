import { ArrowUpRight } from "lucide-react";

import { Carousel } from "@/components/home/carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, WRAP } from "@/components/home/styles";
import { RatingBox, ReviewCard, isRealFigure } from "@/components/reviews/review-parts";
import placeholders from "@/lib/data/home-placeholders.json";
import { first, overlayText, rows, texts } from "@/lib/content/managed-text";

// The managed page's reviews block over the sample content: quotes, locations and
// services come from the page; a name or business the page leaves empty keeps the
// sample placeholder. Rating figures are never filled from the sample: until the
// page has a real rating the rating box is left out.
function fromManaged(data) {
  const sample = placeholders.reviews;
  const items = rows(data.items)
    .filter((item) => first(item.quote))
    .map((item, index) => {
      const base = sample.items[index % sample.items.length];
      const services = texts(item.services);
      return {
        id: `managed-${index}`,
        quote: first(item.quote),
        name: first(item.name) || base.name,
        business: first(item.business) || base.business,
        location: first(item.location) || base.location,
        rating: first(item.rating),
        services: services.length ? services : base.services,
      };
    });
  const rating = {
    ...sample.rating,
    value: first(data.rating_value),
    count: first(data.rating_count),
    source: first(data.rating_source),
  };
  const own = {
    "homeA.reviews.eyebrow": first(data.eyebrow),
    "homeA.reviews.title": first(data.heading),
    "homeA.reviews.intro": first(data.intro),
    "homeA.reviews.overall": first(data.rating_label),
    "homeA.reviews.chip": first(data.trust_label),
    "homeA.reviews.servicesTaken": first(data.services_label),
    "homeA.reviews.viewAll": first(data.cta_label),
  };
  return { items: items.length ? items : sample.items, rating, own };
}

/**
 * Client experiences. The rating box and the quotes come from
 * lib/data/home-placeholders.json: they are SAMPLE content (flagged
 * `placeholder`) and the section says so on the page. Replace the data file with
 * verified reviews and clear the flag when Rapid supplies them. "View all
 * reviews" is disabled (not actionable) until a reviews archive exists.
 */
// `padding`: the section's vertical padding (the managed site pages use their own, smaller rhythm).
export function ReviewsSection({ text: baseText, data, padding = "py-12 sm:py-16 lg:py-20" }) {
  const managed = data ? fromManaged(data) : null;
  const text = managed ? overlayText(baseText, managed.own) : baseText;
  const t = (key, values) => text(`homeA.reviews.${key}`, values);
  const { placeholder } = placeholders.reviews;
  const rating = managed?.rating ?? placeholders.reviews.rating;
  const items = managed?.items ?? placeholders.reviews.items;
  if (!items.length) return null;

  return (
    <section id="reviews" aria-labelledby="home-reviews-title" className={`scroll-mt-24 bg-[#f1f5f2] ${padding}`}>
      <div className={WRAP}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading id="home-reviews-title" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

          <RatingBox
            label={t("overall")}
            value={rating.value}
            outOf={rating.outOf}
            countText={isRealFigure(rating.count) ? `${rating.count} ${t("count")}` : ""}
            sourceText={isRealFigure(rating.source) ? `${t("source")}: ${rating.source}` : ""}
          />
        </div>

        <Carousel
          className="mt-8"
          label={t("carousel")}
          previous={t("previous")}
          next={t("next")}
          lead={placeholder ? <p className="m-0! text-sm leading-6 text-slate-700">{t("placeholder")}</p> : null}
        >
          {items.map((review) => (
            <ReviewCard
              key={review.id}
              quote={review.quote}
              rating={review.rating}
              name={review.name}
              business={review.business}
              location={review.location}
              services={review.services}
              trustLabel={t("chip")}
              servicesLabel={t("servicesTaken")}
              placeholder={placeholder}
            />
          ))}
        </Carousel>

        <div className="mt-6 flex flex-col items-end gap-2 text-right">
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-describedby="home-reviews-hint"
            className={`${BTN_LIME} cursor-not-allowed`}
          >
            {t("viewAll")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
          <p id="home-reviews-hint" className="m-0! text-xs text-slate-700">
            {t("viewAllHint")}
          </p>
        </div>
      </div>
    </section>
  );
}
