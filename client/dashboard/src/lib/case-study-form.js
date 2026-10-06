// Form <-> API conversion for case studies.

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
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
