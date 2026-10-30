// Author / reviewer fields shared by the article, scheme and case study forms.
import { z } from "zod";

// Review status of the content. Public credit ("Reviewed by ...") appears
// only when it is "completed". "none" is stored as such.
export const REVIEW_STATUSES = [
  { value: "none", label: "None" },
  { value: "assigned", label: "Assigned" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const REVIEW_STATUS_VALUES = REVIEW_STATUSES.map((status) => status.value);

export const authorFieldsDefaults = {
  author_id: "",
  reviewer_id: "",
  reviewed_at: "",
  review_status: "none",
};

// Zod fields to spread into a form schema.
export const authorFieldsSchema = {
  author_id: z.string(),
  reviewer_id: z.string(),
  reviewed_at: z.string().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date"),
  review_status: z.enum(["none", "assigned", "pending", "completed"]),
};

// API record -> form values. The API embeds author / reviewer objects and
// also sends the ids.
export const authorFieldsFromRecord = (item) => ({
  author_id: item?.author_id ?? item?.author?.id ?? "",
  reviewer_id: item?.reviewer_id ?? item?.reviewer?.id ?? "",
  reviewed_at: item?.reviewed_at ? String(item.reviewed_at).slice(0, 10) : "",
  review_status: REVIEW_STATUS_VALUES.includes(item?.review_status) ? item.review_status : "none",
});

// Form values -> request body. Empty = null (clears it); the date only goes
// with a reviewer.
export const authorFieldsPayload = (values) => {
  const reviewerId = values.reviewer_id ? String(values.reviewer_id) : null;
  return {
    author_id: values.author_id ? String(values.author_id) : null,
    reviewer_id: reviewerId,
    reviewed_at: reviewerId && values.reviewed_at ? values.reviewed_at : null,
    review_status: REVIEW_STATUS_VALUES.includes(values.review_status) ? values.review_status : "none",
  };
};
