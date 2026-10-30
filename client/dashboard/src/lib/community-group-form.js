// Form <-> API conversion for community groups.

export const emptyCommunityGroup = {
  name: "",
  audience: "",
  updates: "",
  cadence: "",
  join_url: "",
  placements: [],
  is_active: true,
  sort_order: 0,
};

export const toFormValues = (item) => {
  if (!item) return emptyCommunityGroup;
  return {
    name: item.name ?? "",
    audience: item.audience ?? "",
    updates: item.updates ?? "",
    cadence: item.cadence ?? "",
    join_url: item.join_url ?? "",
    placements: Array.isArray(item.placements) ? item.placements : [],
    is_active: item.is_active ?? true,
    sort_order: item.sort_order ?? 0,
  };
};

// Empty text fields are sent as "" so the server clears them.
export const buildPayload = (values) => ({
  name: values.name.trim(),
  audience: values.audience.trim(),
  updates: values.updates
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n"),
  cadence: values.cadence.trim(),
  join_url: values.join_url.trim(),
  placements: values.placements,
  is_active: values.is_active,
  sort_order: Number(values.sort_order) || 0,
});
