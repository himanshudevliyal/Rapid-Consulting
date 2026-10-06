// Form <-> API conversion for schemes.

export const RICH_FIELDS = [
  ["description", "About the scheme", "What the scheme is and who runs it."],
  ["eligibility", "Eligibility", "Who can apply and what rules apply."],
  ["benefits", "Benefits", "Subsidy, interest support or other benefit."],
  ["application_process", "Application process", "Steps, documents and where to apply."],
];

export const emptyScheme = {
  title: "",
  slug: "",
  ministry: "",
  official_url: "",
  cover_image: "",
  category_id: "",
  family_code: "",
  tags: "",
  is_published: false,
  description: "",
  eligibility: "",
  benefits: "",
  application_process: "",
};

// API record -> form values. The Family / topic is stored as one of the
// tags (its code), so it is split out of the tags here and picked by name in
// the form; the other tags become a comma separated line.
export const toFormValues = (scheme, familyCodes = []) => {
  if (!scheme) return emptyScheme;
  const tags = Array.isArray(scheme.tags) ? scheme.tags : [];
  const family = tags.find((tag) => familyCodes.includes(tag)) ?? "";
  return {
    title: scheme.title ?? "",
    slug: scheme.slug ?? "",
    ministry: scheme.ministry ?? "",
    official_url: scheme.official_url ?? "",
    cover_image: scheme.cover_image ?? "",
    category_id: scheme.category_id ?? "",
    family_code: family,
    tags: tags.filter((tag) => tag !== family).join(", "),
    is_published: !!scheme.is_published,
    description: scheme.description ?? "",
    eligibility: scheme.eligibility ?? "",
    benefits: scheme.benefits ?? "",
    application_process: scheme.application_process ?? "",
  };
};

// Form values -> request body. An empty slug is left out: on create the
// server makes one from the title, on edit the current slug stays.
export const buildPayload = (values) => {
  const payload = {
    title: values.title.trim(),
    ministry: values.ministry.trim(),
    official_url: values.official_url.trim(),
    cover_image: values.cover_image.trim(),
    category_id: values.category_id || "",
    // The chosen Family / topic goes first, then the other tags.
    tags: [
      ...new Set(
        [values.family_code, ...values.tags.split(",")].map((tag) => (tag ?? "").trim()).filter(Boolean),
      ),
    ],
    is_published: values.is_published,
    description: values.description,
    eligibility: values.eligibility,
    benefits: values.benefits,
    application_process: values.application_process,
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
