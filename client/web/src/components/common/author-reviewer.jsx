import { PersonCard } from "./person-card";
import { formatDate } from "@/lib/format-date";

// Author and reviewer of one content item: two distinct roles, each a linked
// name card. Nothing is invented: no author -> no "Written by"; no reviewer ->
// no review block at all; "Reviewed on <date>" only when a reviewer exists and
// the review date has been confirmed.
//
//   page: { author, reviewer, reviewedAt, locale }  (see adapters.editorial)
//   variant: "hero" (compact, under the title) | "review" (References & review)
export function AuthorReviewer({ page, t, variant = "hero", className = "" }) {
  const { author, reviewer, reviewedAt, locale = "en" } = page;
  const showAuthor = variant === "hero" && author;
  if (!showAuthor && !reviewer) return null;

  const date = reviewer && reviewedAt ? formatDate(reviewedAt, locale) : "";
  const placeholderLabel = t("detail.people.placeholderProfile");
  const reviewedNote = date
    ? t("detail.people.reviewedOn", { date })
    : variant === "review"
      ? t("detail.people.reviewDatePending")
      : undefined;

  const cards = [
    showAuthor && (
      <PersonCard key="author" person={author} role={t("detail.people.writtenBy")} placeholderLabel={placeholderLabel} />
    ),
    reviewer && (
      <PersonCard
        key="reviewer"
        person={reviewer}
        role={t("detail.people.reviewedBy")}
        note={reviewedNote}
        placeholderLabel={placeholderLabel}
      />
    ),
  ].filter(Boolean);

  return (
    <div
      data-component="AuthorReviewer"
      className={`my-6 grid gap-3 ${cards.length > 1 ? "sm:grid-cols-2" : "max-w-md"} ${className}`}
    >
      {cards}
    </div>
  );
}
