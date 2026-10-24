// Form <-> API conversion for advisers (the people shown on the About page).

export const emptyAdviser = {
  name: "",
  designation: "",
  team_group: "",
  bio: "",
  photo: "",
  linkedin_url: "",
  display_order: 0,
  is_active: true,
};

export const toFormValues = (adviser) => {
  if (!adviser) return emptyAdviser;
  return {
    name: adviser.name ?? "",
    designation: adviser.designation ?? "",
    team_group: adviser.team_group ?? "",
    bio: adviser.bio ?? "",
    photo: adviser.photo ?? "",
    linkedin_url: adviser.linkedin_url ?? "",
    display_order: adviser.display_order ?? 0,
    is_active: adviser.is_active ?? true,
  };
};

// Empty text fields are sent as "" so the server clears them.
export const buildPayload = (values) => ({
  name: values.name.trim(),
  designation: values.designation.trim(),
  team_group: values.team_group.trim(),
  bio: values.bio.trim(),
  photo: values.photo.trim(),
  linkedin_url: values.linkedin_url.trim(),
  display_order: Number(values.display_order) || 0,
  is_active: values.is_active,
});
