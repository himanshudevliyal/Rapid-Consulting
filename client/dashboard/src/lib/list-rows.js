// Rows + total for a list response. The API answers either a page
// ({ data, total, ... }) - used as it is - or a plain array of every record,
// which is then searched (q), filtered (is_active) and paged here.
export const listRows = (data, searchParams, matches) => {
  if (!Array.isArray(data)) return { rows: data?.data ?? [], total: data?.total ?? 0 };

  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const active = searchParams.get("is_active"); // "true" | "false" | null
  const filtered = data.filter(
    (row) =>
      (!q || matches(row, q)) && (active !== "true" && active !== "false" ? true : !!row.is_active === (active === "true")),
  );
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
  return { rows: filtered.slice((page - 1) * limit, page * limit), total: filtered.length };
};
