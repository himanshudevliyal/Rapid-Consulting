// Form <-> API conversion for case studies.
import { authorFieldsDefaults, authorFieldsFromRecord, authorFieldsPayload } from "@/lib/author-fields";

export const RICH_FIELDS = [
  ["challenge", "Challenge", "What the client needed or was struggling with."],
  ["solution", "Solution", "What was done."],
  ["result", "Result", "What changed for the client."],
];

export const emptyCaseStudy = {
  title: "",
  slug: "",
  client_name: "",
  industry: "",
  cover_image: "",
  tags: "",
  is_published: false,
  challenge: "",
  solution: "",
  result: "",
  location: "",
  sector: "",
  rapid_role: "",
  proof_image: "",
  proof_caption: "",
  milestone_label: "",
  milestone_date: "",
  quote_text: "",
  quote_attribution: "",
  ...authorFieldsDefaults,
};

// API record -> form values (tags become a comma separated line).
export const toFormValues = (item) => {
  if (!item) return emptyCaseStudy;
  return {
    title: item.title ?? "",
    slug: item.slug ?? "",
    client_name: item.client_name ?? "",
    industry: item.industry ?? "",
    cover_image: item.cover_image ?? "",
    tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    is_published: !!item.is_published,
    challenge: item.challenge ?? "",
    solution: item.solution ?? "",
    result: item.result ?? "",
    location: item.location ?? "",
    sector: item.sector ?? "",
    rapid_role: item.rapid_role ?? "",
    proof_image: item.proof_image ?? "",
    proof_caption: item.proof_caption ?? "",
    milestone_label: item.milestone_label ?? "",
    milestone_date: item.milestone_date ? String(item.milestone_date).slice(0, 10) : "",
    quote_text: item.quote_text ?? "",
    quote_attribution: item.quote_attribution ?? "",
    ...authorFieldsFromRecord(item),
  };
};

// Form values -> request body. An empty slug is left out: on create the
// server makes one from the title, on edit the current slug stays.
export const buildPayload = (values) => {
  const payload = {
    title: values.title.trim(),
    client_name: values.client_name.trim(),
    industry: values.industry.trim(),
    cover_image: values.cover_image.trim(),
    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    is_published: values.is_published,
    challenge: values.challenge,
    solution: values.solution,
    result: values.result,
    location: values.location.trim(),
    sector: values.sector.trim(),
    rapid_role: values.rapid_role.trim(),
    proof_image: values.proof_image.trim(),
    proof_caption: values.proof_caption.trim(),
    milestone_label: values.milestone_label.trim(),
    // An empty date clears it.
    milestone_date: values.milestone_date || null,
    quote_text: values.quote_text.trim(),
    quote_attribution: values.quote_attribution.trim(),
    ...authorFieldsPayload(values),
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
