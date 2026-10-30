import { z } from "zod";

// "" means "cleared" (stored as null); a field that was not sent stays
// undefined so an update never touches it.
const blankToNull = (value) => (value === undefined ? undefined : value || null);

// Id of a team member (/v1/advisers); "" clears it.
const personId = (message) =>
  z
    .union([z.literal(""), z.uuid(message)])
    .nullish()
    .transform(blankToNull);

// "2026-12-31" (or a full ISO date, cut to its day); "" / null = no date.
export const optionalDate = (message = "Enter a valid date") =>
  z
    .string()
    .trim()
    .nullish()
    .transform((value) => (value === undefined ? undefined : value ? value.slice(0, 10) : null))
    .refine(
      (value) => value === undefined || value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
      message,
    );

// Where the review of an item stands: none | assigned | pending | completed.
// It is recorded separately from the reviewer and the review date; "" clears it.
export const REVIEW_STATUSES = ["none", "assigned", "pending", "completed"];
const reviewStatus = z
  .union([z.literal(""), z.enum(REVIEW_STATUSES, "Review status must be none, assigned, pending or completed")])
  .nullish()
  .transform(blankToNull);

// Author, reviewer, review status and review date shared by articles, schemes
// and case studies. The review date is cleared by the controller when no
// reviewer is set.
export const editorialFields = {
  author_id: personId("Pick a valid author"),
  reviewer_id: personId("Pick a valid reviewer"),
  review_status: reviewStatus,
  reviewed_at: optionalDate("Reviewed on must be a valid date"),
};
