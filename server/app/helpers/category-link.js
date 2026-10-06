import { QueryTypes } from "sequelize";
import { StatusCodes } from "http-status-codes";
import constants from "../lib/constants/index.js";
import { sequelize } from "../db/postgres.js";

const CATEGORY = constants.models.CATEGORY_TABLE;

const plain = (item) => (typeof item?.toJSON === "function" ? item.toJSON() : item);

// Adds `category: { id, title, slug } | null` to a record or a list of
// records (Sequelize instances or plain rows) with one query for the lot.
export const withCategory = async (input) => {
  const list = (Array.isArray(input) ? input : [input]).map(plain);
  const ids = [...new Set(list.map((item) => item?.category_id).filter(Boolean))];

  const byId = new Map();
  if (ids.length) {
    const rows = await sequelize.query(
      `SELECT id, title, slug FROM ${CATEGORY} WHERE id IN (:ids)`,
      { replacements: { ids }, type: QueryTypes.SELECT },
    );
    rows.forEach((row) => byId.set(row.id, row));
  }

  const result = list.map((item) =>
    item ? { ...item, category: byId.get(item.category_id) ?? null } : item,
  );
  return Array.isArray(input) ? result : result[0];
};

// Query-string filter: a malformed id matches nothing instead of erroring.
export const categoryFilter = (id) =>
  !id ? undefined : /^[0-9a-f-]{36}$/i.test(id) ? id : "00000000-0000-0000-0000-000000000000";

// Throws a 400 when the id is not an existing category (null clears it).
export const assertCategory = async (id) => {
  if (!id) return;
  const [row] = await sequelize.query(
    `SELECT id FROM ${CATEGORY} WHERE id = :id`,
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!row) {
    const error = new Error("category_id - this category does not exist");
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.validation = true;
    throw error;
  }
};
