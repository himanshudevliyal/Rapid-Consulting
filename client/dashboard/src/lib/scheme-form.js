// Form <-> API conversion for schemes.
import { authorFieldsDefaults, authorFieldsFromRecord, authorFieldsPayload } from "@/lib/author-fields";
import { cleanSections } from "@/lib/service-form";

// The "at a glance" rows a new scheme starts with: the labels only; the values are
// written for each scheme. Rows can be added, removed and reordered.
export const DEFAULT_QUICK_FACTS = [
  { label: "What it pays", example: "3% a year off your loan interest, for up to 7 years", bold: false },
  { label: "On loans up to", example: "₹2 crore", bold: true },
  { label: "Who can apply", example: "Farmers, FPOs, cooperatives and the other bodies the guidelines name", bold: false },
  { label: "What it covers", example: "Post-harvest infrastructure and primary processing", bold: false },
  { label: "Your share", example: "At least 10% of the project cost", bold: false },
  { label: "Scheme", example: "Central, Ministry of ...; runs to 2032-33", bold: false },
  { label: "Status", example: "Open for new loans", bold: true },
  { label: "Official source", example: "Leave empty to link the Official URL", bold: false },
].map((row) => ({ ...row, value: "" }));

const rowsFromRecord = (scheme) => {
  if (Array.isArray(scheme.quick_facts) && scheme.quick_facts.length) {
    return scheme.quick_facts.map((row) => ({ label: row.label ?? "", value: row.value ?? "", bold: !!row.bold }));
  }
  // An older scheme: the four fixed facts become rows, so nothing is lost.
  return [
    ["What it pays", scheme.assistance_type, true],
    ["What it covers", scheme.relevant_activity, false],
    ["Policy period", scheme.policy_period, false],
    ["Application window", scheme.application_window, false],
  ]
    .filter(([, value]) => value)
    .map(([label, value, bold]) => ({ label, value, bold }));
};

const sectionsFromRecord = (scheme) =>
  (Array.isArray(scheme.sections) ? scheme.sections : []).map((s) => ({
    key: s.key ?? "",
    title: s.title ?? "",
    nav_label: s.nav_label ?? "",
    eyebrow: s.eyebrow ?? "",
    role: s.role ?? "content",
    html: s.html ?? "",
    intro_html: s.intro_html ?? "",
    items: (s.items ?? []).map((i) => ({ key: i.key ?? "", title: i.title ?? "", html: i.html ?? "" })),
    outro_html: s.outro_html ?? "",
  }));

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
  pdf_url: "",
  category_id: "",
  family_code: "",
  tags: "",
  is_published: false,
  is_featured: false,
  description: "",
  eligibility: "",
  benefits: "",
  application_process: "",
  assistance_type: "",
  relevant_activity: "",
  policy_period: "",
  application_window: "",
  status: "",
  quick_facts: DEFAULT_QUICK_FACTS.map((row) => ({ ...row })),
  sections: [],
  ...authorFieldsDefaults,
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
    pdf_url: scheme.pdf_url ?? "",
    category_id: scheme.category_id ?? "",
    family_code: family,
    tags: tags.filter((tag) => tag !== family).join(", "),
    is_published: !!scheme.is_published,
    is_featured: !!scheme.is_featured,
    description: scheme.description ?? "",
    eligibility: scheme.eligibility ?? "",
    benefits: scheme.benefits ?? "",
    application_process: scheme.application_process ?? "",
    assistance_type: scheme.assistance_type ?? "",
    relevant_activity: scheme.relevant_activity ?? "",
    policy_period: scheme.policy_period ?? "",
    application_window: scheme.application_window ?? "",
    status: ["open", "upcoming", "closed", "historical"].includes(scheme.status) ? scheme.status : "",
    quick_facts: rowsFromRecord(scheme),
    sections: sectionsFromRecord(scheme),
    ...authorFieldsFromRecord(scheme),
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
    pdf_url: (values.pdf_url ?? "").trim(),
    category_id: values.category_id || "",
    // The chosen Family / topic goes first, then the other tags.
    tags: [
      ...new Set(
        [values.family_code, ...values.tags.split(",")].map((tag) => (tag ?? "").trim()).filter(Boolean),
      ),
    ],
    is_published: values.is_published,
    is_featured: values.is_featured,
    description: values.description,
    eligibility: values.eligibility,
    benefits: values.benefits,
    application_process: values.application_process,
    assistance_type: values.assistance_type.trim(),
    relevant_activity: values.relevant_activity.trim(),
    policy_period: values.policy_period.trim(),
    application_window: values.application_window.trim(),
    // Empty = no status (null on the server).
    status: values.status || null,
    // Rows without a label are dropped.
    quick_facts: (values.quick_facts ?? [])
      .map((row) => ({ label: row.label.trim(), value: (row.value ?? "").trim(), bold: !!row.bold }))
      .filter((row) => row.label),
    sections: cleanSections(values.sections ?? []),
    ...authorFieldsPayload(values),
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
