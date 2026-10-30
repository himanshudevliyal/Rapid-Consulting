// Form <-> API conversion for advisers (the people shown on the About page).

export const emptyAdviser = {
  name: "",
  slug: "",
  designation: "",
  team_group: "",
  bio: "",
  expertise: "",
  photo: "",
  linkedin_url: "",
  display_order: 0,
  is_active: true,
  is_placeholder: false,
};

export const toFormValues = (adviser) => {
  if (!adviser) return emptyAdviser;
  return {
    name: adviser.name ?? "",
    slug: adviser.slug ?? "",
    designation: adviser.designation ?? "",
    team_group: adviser.team_group ?? "",
    bio: adviser.bio ?? "",
    expertise: adviser.expertise ?? "",
    photo: adviser.photo ?? "",
    linkedin_url: adviser.linkedin_url ?? "",
    display_order: adviser.display_order ?? 0,
    is_active: adviser.is_active ?? true,
    is_placeholder: !!adviser.is_placeholder,
  };
};

// Empty text fields are sent as "" so the server clears them. An empty slug
// is left out: on create the server makes one from the name, on edit the
// current slug stays. Expertise is one item per line (blank lines dropped).
export const buildPayload = (values) => {
  const payload = {
    name: values.name.trim(),
    designation: values.designation.trim(),
    team_group: values.team_group.trim(),
    bio: values.bio.trim(),
    expertise: values.expertise
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n"),
    photo: values.photo.trim(),
    linkedin_url: values.linkedin_url.trim(),
    display_order: Number(values.display_order) || 0,
    is_active: values.is_active,
    is_placeholder: values.is_placeholder,
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
