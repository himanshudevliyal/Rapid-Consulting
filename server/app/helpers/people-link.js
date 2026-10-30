import { QueryTypes } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../db/postgres.js";

const ADVISERS = "advisers";

const plain = (item) => (typeof item?.toJSON === "function" ? item.toJSON() : item);

// Adds `author` and `reviewer` - { id, slug, name, designation, photo,
// is_placeholder } or null - to a record or a list of records (Sequelize
// instances or plain rows) that carry author_id / reviewer_id, with one query
// for the lot. Only these few columns are read, so lists stay light.
export const withPeople = async (input) => {
  const list = (Array.isArray(input) ? input : [input]).map(plain);
  const ids = [
    ...new Set(
      list.flatMap((item) => [item?.author_id, item?.reviewer_id]).filter(Boolean),
    ),
  ];

  const byId = new Map();
  if (ids.length) {
    const rows = await sequelize.query(
      `SELECT id, slug, name, designation, photo, is_placeholder FROM ${ADVISERS} WHERE id IN (:ids)`,
      { replacements: { ids }, type: QueryTypes.SELECT },
    );
    rows.forEach((row) => byId.set(row.id, row));
  }

  const result = list.map((item) =>
    item
      ? {
          ...item,
          author: byId.get(item.author_id) ?? null,
          reviewer: byId.get(item.reviewer_id) ?? null,
        }
      : item,
  );
  return Array.isArray(input) ? result : result[0];
};

// Throws a 400 when an id is not an existing adviser (null clears it).
export const assertPeople = async (data) => {
  for (const field of ["author_id", "reviewer_id"]) {
    const id = data[field];
    if (!id) continue;
    const [row] = await sequelize.query(`SELECT id FROM ${ADVISERS} WHERE id = :id`, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });
    if (!row) {
      const error = new Error(`${field} - this team member does not exist`);
      error.statusCode = StatusCodes.BAD_REQUEST;
      error.validation = true;
      throw error;
    }
  }
};

// A review date only means something when a reviewer is named: without one it
// is cleared. `previous` is the stored record (omit it on create).
export const applyReviewRule = (data, previous) => {
  if (!("reviewer_id" in data) && !("reviewed_at" in data)) return data;
  const reviewerId = "reviewer_id" in data ? data.reviewer_id : previous?.reviewer_id;
  if (!reviewerId) data.reviewed_at = null;
  return data;
};
