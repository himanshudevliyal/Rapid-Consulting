"use strict";
import { DataTypes, Op, literal } from "sequelize";
import { randomBytes } from "node:crypto";

let SitePageModel = null;

const TABLE = "site_pages";

const init = async (sequelize) => {
  SitePageModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      // Stable identity ("pg_" + 10 random characters); never changes, unlike the path.
      page_key: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      // The English and Hindi versions of one page share a group_id.
      group_id: { type: DataTypes.UUID, allowNull: false },
      // hub | situation | campaign | resource | service | profile | scheme
      template: { type: DataTypes.STRING(20), allowNull: false },
      // en | hi
      locale: { type: DataTypes.STRING(5), allowNull: false },
      // No leading slash, e.g. "your-project/setting-up"; unique per locale.
      path: { type: DataTypes.STRING(300), allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      h1: { type: DataTypes.STRING(300), allowNull: true },
      meta_title: { type: DataTypes.STRING(255), allowNull: true },
      meta_description: { type: DataTypes.TEXT, allowNull: true },
      // draft | review | published | archived
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "draft" },
      // not_needed | missing | needs_review | reviewed
      translation_status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "missing" },
      // The draft composition (array of section objects).
      sections: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      // What the public site shows: a snapshot taken at publish time (null = not live).
      published_sections: { type: DataTypes.JSONB, allowNull: true },
      // title / h1 / meta_title / meta_description as they were at publish time.
      published_meta: { type: DataTypes.JSONB, allowNull: true },
      published_at: { type: DataTypes.DATE, allowNull: true },
      version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      has_unpublished_changes: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_by: { type: DataTypes.UUID, allowNull: true },
      updated_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { name: "site_pages_locale_path_key", unique: true, fields: ["locale", "path"] },
        { name: "site_pages_group_locale_key", unique: true, fields: ["group_id", "locale"] },
        { name: "site_pages_status_idx", fields: ["status"] },
        { name: "site_pages_template_idx", fields: ["template"] },
      ],
    },
  );

  await SitePageModel.sync({ alter: false, force: false });
};

const KEY_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const randomKey = () => {
  const bytes = randomBytes(10);
  return `pg_${Array.from(bytes, (byte) => KEY_CHARS[byte % KEY_CHARS.length]).join("")}`;
};

const generateKey = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const key = randomKey();
    if (!(await SitePageModel.findOne({ where: { page_key: key }, attributes: ["id"] }))) return key;
  }
  throw new Error("Could not generate a unique page key");
};

// Adds the computed fields to a page (Sequelize instance or plain row):
// is_live = the public site shows a published version of it.
const present = (page) => {
  if (!page) return page;
  const row = typeof page.toJSON === "function" ? page.toJSON() : { ...page };
  row.is_live = !!row.published_sections;
  if (Array.isArray(row.sections) && row.section_count === undefined) row.section_count = row.sections.length;
  return row;
};

// Admin list: no section bodies, but section_count and has_unpublished_changes.
const getAll = async ({ q, template, locale, status, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (template) where.template = template;
  if (locale) where.locale = locale;
  if (status) where.status = status;
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { h1: { [Op.iLike]: `%${q}%` } },
      { path: { [Op.iLike]: `%${q}%` } },
      { page_key: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await SitePageModel.findAndCountAll({
    where,
    attributes: {
      exclude: ["sections", "published_sections"],
      include: [
        [literal(`jsonb_array_length(COALESCE("sections", '[]'::jsonb))`), "section_count"],
        [literal(`("published_sections" IS NOT NULL)`), "is_live"],
      ],
    },
    order: [
      ["updated_at", "DESC"],
      ["created_at", "DESC"],
    ],
    limit,
    offset,
  });
  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data: rows.map((row) => row.toJSON()),
  };
};

const getById = async (id) => SitePageModel.findByPk(id);
const getByKey = async (page_key) => SitePageModel.findOne({ where: { page_key } });

const LIVE = { published_sections: { [Op.ne]: null }, status: { [Op.ne]: "archived" } };

// The live (published) page at a path, or null.
const getLiveByPath = async (path, locale) =>
  SitePageModel.findOne({ where: { path, locale, ...LIVE } });

// Public list of live pages.
const getLiveList = async ({ locale, template } = {}) => {
  const where = { ...LIVE };
  if (locale) where.locale = locale;
  if (template) where.template = template;
  return SitePageModel.findAll({
    where,
    attributes: [
      "id",
      "page_key",
      "group_id",
      "template",
      "locale",
      "path",
      "title",
      "published_meta",
      "published_at",
      "updated_at",
    ],
    order: [
      ["locale", "ASC"],
      ["path", "ASC"],
    ],
  });
};

// Other versions of the same page (other languages).
const getCounterparts = async (group_id, excludeId) =>
  SitePageModel.findAll({
    where: { group_id, id: { [Op.ne]: excludeId } },
    attributes: ["id", "locale", "status", "translation_status", "path", "published_sections"],
    order: [["locale", "ASC"]],
  });

const getGroup = async (group_id) => SitePageModel.findAll({ where: { group_id } });

const pathTaken = async (path, locale, excludeId) => {
  const where = { path, locale };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return !!(await SitePageModel.findOne({ where, attributes: ["id"] }));
};

const create = async (data) => {
  const page_key = data.page_key || (await generateKey());
  return SitePageModel.create({ ...data, page_key });
};

const updateById = async (id, data) => {
  const [updated, rows] = await SitePageModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};

// Same translation status on every language version of a page.
const setGroupTranslationStatus = async (group_id, translation_status) =>
  SitePageModel.update({ translation_status }, { where: { group_id } });

const deleteById = async (id) => SitePageModel.destroy({ where: { id } });

export default {
  init,
  present,
  getAll,
  getById,
  getByKey,
  getLiveByPath,
  getLiveList,
  getCounterparts,
  getGroup,
  pathTaken,
  create,
  updateById,
  setGroupTranslationStatus,
  deleteById,
};
