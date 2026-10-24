// Form <-> API conversion for industries.

export const emptyIndustry = {
  name: "",
  slug: "",
  h1: "",
  description: "",
  icon: "",
  image: "",
  display_order: 0,
  is_active: true,
  intro: "",
  content: "",
  note: "",
  meta_title: "",
  meta_description: "",
  service_slugs: [],
  scheme_slugs: [],
};

// Picker values are { value, label } objects; the API keeps plain slugs.
const toOptions = (slugs, options = []) =>
  (Array.isArray(slugs) ? slugs : []).map((slug) => ({
    value: slug,
    label: options.find((option) => option.value === slug)?.label ?? slug,
  }));

export const toFormValues = (industry, { services = [], schemes = [] } = {}) => {
  if (!industry) return emptyIndustry;
  return {
    name: industry.name ?? "",
    slug: industry.slug ?? "",
    h1: industry.h1 ?? "",
    description: industry.description ?? "",
    icon: industry.icon ?? "",
    image: industry.image ?? "",
    display_order: industry.display_order ?? 0,
    is_active: industry.is_active ?? true,
    intro: industry.intro ?? "",
    content: industry.content ?? "",
    note: industry.note ?? "",
    meta_title: industry.meta_title ?? "",
    meta_description: industry.meta_description ?? "",
    service_slugs: toOptions(industry.service_slugs, services),
    scheme_slugs: toOptions(industry.scheme_slugs, schemes),
  };
};

// An empty slug is left out: on create the server makes one from the name,
// on edit the current slug stays.
export const buildPayload = (values) => {
  const payload = {
    name: values.name.trim(),
    h1: values.h1.trim(),
    description: values.description.trim(),
    icon: values.icon.trim(),
    image: values.image.trim(),
    display_order: Number(values.display_order) || 0,
    is_active: values.is_active,
    intro: values.intro,
    content: values.content,
    note: values.note.trim(),
    meta_title: values.meta_title.trim(),
    meta_description: values.meta_description.trim(),
    service_slugs: values.service_slugs.map((option) => option.value),
    scheme_slugs: values.scheme_slugs.map((option) => option.value),
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
