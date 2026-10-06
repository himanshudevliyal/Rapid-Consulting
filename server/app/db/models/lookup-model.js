"use strict";
import { DataTypes, Op, QueryTypes } from "sequelize";
import slugify from "slugify";
import constants from "../../lib/constants/index.js";

// Shared model for the small admin-managed option lists of the service form
// (Format and Family / topic). `usageColumn` is the services column that
// stores the option's `code`, used to show and protect "in use" options.
export const createLookupModel = ({
  table,
  usageColumn,
  attributes = {},
  editable = [],
  codePrefix = null, // set: S01, S02, ... otherwise the code is made from the name
}) => {
  let Model = null;
  const EDITABLE = ["name", "description", "sort_order", "is_active", ...editable];

  const init = async (sequelize) => {
    Model = sequelize.define(
      table,
      {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
        name: { type: DataTypes.STRING(160), allowNull: false },
        description: { type: DataTypes.TEXT },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        ...attributes,
      },
      { tableName: table, createdAt: "created_at", updatedAt: "updated_at" },
    );
    return Model;
  };

  // How many services use each code: { S01: 12, S02: 3 }
  const usageByCode = async (codes) => {
    if (!codes.length) return {};
    const rows = await Model.sequelize.query(
      `SELECT ${usageColumn} AS code, COUNT(*)::integer AS total
         FROM ${constants.models.SERVICE_TABLE}
        WHERE ${usageColumn} IN (:codes)
        GROUP BY ${usageColumn}`,
      { replacements: { codes }, type: QueryTypes.SELECT },
    );
    return Object.fromEntries(rows.map((row) => [row.code, row.total]));
  };

  const withUsage = async (rows) => {
    const usage = await usageByCode(rows.map((row) => row.code));
    return rows.map((row) => ({ ...row, service_count: usage[row.code] ?? 0 }));
  };

  const getAll = async ({ q, is_active, page = 1, limit = null } = {}) => {
    const where = {};
    if (is_active === true || is_active === false) where.is_active = is_active;
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { code: { [Op.iLike]: `%${q}%` } },
      ];
    }
    const { count, rows } = await Model.findAndCountAll({
      where,
      order: [["sort_order", "ASC"], ["name", "ASC"]],
      ...(limit ? { limit, offset: (page - 1) * limit } : {}),
      raw: true,
    });
    return { total: count, rows: await withUsage(rows) };
  };

  const getById = async (id) => {
    const row = await Model.findByPk(id, { raw: true });
    return row ? (await withUsage([row]))[0] : null;
  };

  const getByCode = async (code) => Model.findOne({ where: { code }, raw: true });

  // Admins give a name only; the code the services store is made here.
  // codePrefix "S" -> next S0n; no prefix -> a slug of the name (landing-page).
  const generateCode = async (name) => {
    if (codePrefix) {
      const rows = await Model.findAll({ attributes: ["code"], raw: true });
      const used = rows
        .map((row) => row.code.match(new RegExp(`^${codePrefix}(\\d+)$`, "i")))
        .filter(Boolean)
        .map((match) => Number(match[1]));
      return `${codePrefix}${String(Math.max(0, ...used) + 1).padStart(2, "0")}`;
    }
    const base = slugify(name, { lower: true, strict: true }) || "option";
    let code = base;
    for (let n = 2; await Model.count({ where: { code } }); n++) code = `${base}-${n}`;
    return code;
  };

  const isActive = async (code) =>
    (await Model.count({ where: { code, is_active: true } })) > 0;

  const create = async (data) => {
    const record = await Model.create(data);
    return { ...record.get({ plain: true }), service_count: 0 };
  };

  const updateById = async (id, data) => {
    const values = Object.fromEntries(
      EDITABLE.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]),
    );
    const [updated] = await Model.update(values, { where: { id } });
    return updated ? getById(id) : null;
  };

  const deleteById = async (id) => Model.destroy({ where: { id } });

  return { init, getAll, getById, getByCode, generateCode, isActive, create, updateById, deleteById };
};
