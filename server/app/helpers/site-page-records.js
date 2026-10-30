import { QueryTypes } from "sequelize";
import { sequelize } from "../db/postgres.js";
import { collectRecordRefs } from "./site-page-registry.js";

// Linked records in a page's sections are stored as { id, slug?, title? }.
// On every save the slug and title are refreshed from the record itself so the
// copy kept in the page is never stale. A record that cannot be found is left
// exactly as it was (the website skips missing / unpublished records), and a
// failed lookup never blocks a save.
//
// record_type -> SQL returning (id, slug, title)
const LOOKUPS = {
  scheme: "SELECT id, slug, title FROM schemes WHERE id IN (:ids)",
  case_study: "SELECT id, slug, title FROM case_studies WHERE id IN (:ids)",
  article: "SELECT id, slug, title FROM articles WHERE id IN (:ids)",
  adviser: "SELECT id, slug, name AS title FROM advisers WHERE id IN (:ids)",
  industry: "SELECT id, slug, name AS title FROM industries WHERE id IN (:ids)",
  // A service's title is its English translation's title.
  service: `SELECT s.id, s.slug, COALESCE(t.title, s.slug) AS title
            FROM services s
            LEFT JOIN service_translations t ON t.service_id = s.id AND t.locale = 'en'
            WHERE s.id IN (:ids)`,
};

export const refreshRecordRefs = async (sections) => {
  const refs = collectRecordRefs(sections);
  const byType = new Map();
  refs.forEach(({ record_type, ref }) => {
    if (!LOOKUPS[record_type]) return;
    byType.set(record_type, [...(byType.get(record_type) ?? []), ref]);
  });

  for (const [recordType, list] of byType) {
    try {
      const ids = [...new Set(list.map((ref) => ref.id))];
      const rows = await sequelize.query(LOOKUPS[recordType], {
        replacements: { ids },
        type: QueryTypes.SELECT,
      });
      const found = new Map(rows.map((row) => [row.id, row]));
      list.forEach((ref) => {
        const row = found.get(ref.id);
        if (!row) return;
        if (row.slug) ref.slug = row.slug;
        if (row.title) ref.title = String(row.title).slice(0, 300);
      });
    } catch (error) {
      console.error(`Site pages: could not refresh ${recordType} references:`, error.message);
    }
  }
  return sections;
};
