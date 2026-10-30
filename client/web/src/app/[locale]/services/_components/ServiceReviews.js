import { Carousel } from "@/components/home/carousel";
import { Html } from "@/components/common/html";
import { RatingBox, ReviewCard } from "@/components/reviews/review-parts";
import { b2bText } from "@/lib/pages/b2b-text";
import { ActionHtml } from "./ActionHtml";

// "reviews" role: "In our clients' words." Every service keeps its own rating
// box (rating_value / rating_count / rating_source, edited in the admin panel)
// and its own review cards (item title = the quote; name, business, location,
// rating and services describe the reviewer). The box is left out until a
// rating is filled in. Card and box are shared with the other reviews sections.
export function ServiceReviews({ section, service, t }) {
  const tx = b2bText(t);
  const reviews = (section.items ?? []).filter((item) => item.title);
  if (!reviews.length) return null;
  const trustLabel = (section.trust_label ?? "").trim() || tx("reviews.trust", "Trusted by growing businesses");
  const servicesLabel = tx("reviews.servicesTaken", "Services taken");
  const count = (section.rating_count ?? "").trim();
  const source = (section.rating_source ?? "").trim();

  return (
    <div data-component="ServiceReviews">
      <Carousel
        label={tx("reviews.region", "Client reviews")}
        previous={tx("reviews.prev", "Previous reviews")}
        next={tx("reviews.next", "Next reviews")}
        lead={
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <Html html={section.intro_html} className="b2b-prose [&_p]:!m-0" />
            <RatingBox
              label={tx("reviews.overall", "Overall rating")}
              value={section.rating_value}
              countText={count ? tx("reviews.count", "{count} client reviews", { count }) : ""}
              sourceText={source ? tx("reviews.source", "Source: {source}", { source }) : ""}
            />
          </div>
        }
      >
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.key || index}
            quote={review.title}
            rating={review.rating}
            name={review.name}
            business={review.business}
            location={review.location}
            services={review.services}
            trustLabel={trustLabel}
            servicesLabel={servicesLabel}
          />
        ))}
      </Carousel>
      <div className="mt-6 flex justify-end">
        <ActionHtml html={section.outro_html} service={service} source="service-reviews" />
      </div>
    </div>
  );
}
