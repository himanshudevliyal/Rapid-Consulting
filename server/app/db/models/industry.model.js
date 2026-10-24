"use strict";
import { DataTypes, Op } from "sequelize";
import slugify from "slugify";

let IndustryModel = null;

const TABLE = "industries";
const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  IndustryModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      // Short name: cards, menus, filters.
      name: { type: DataTypes.STRING(160), allowNull: false },
      slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
      // Card text.
      description: { type: DataTypes.TEXT, allowNull: true },
      // Name of an icon in the website's icon set (e.g. "leaf").
      icon: { type: DataTypes.STRING(500), allowNull: true },
      display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      // Page heading (falls back to name), SEO, opening copy and the body.
      h1: { type: DataTypes.STRING(255), allowNull: true },
      meta_title: { type: DataTypes.STRING(255), allowNull: true },
      meta_description: { type: DataTypes.TEXT, allowNull: true },
      intro: { type: DataTypes.TEXT, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: true },
      // Picture saved by the upload API (public/images/...).
      image: { type: DataTypes.STRING(500), allowNull: true },
      // Note shown above the schemes list on the industry page.
      note: { type: DataTypes.TEXT, allowNull: true },
      // Services / schemes (by slug) shown on the industry page.
      service_slugs: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
      scheme_slugs: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await IndustryModel.sync({ alter: false, force: false });
};

const slugBase = (name) => makeSlug(name) || `industry-${Date.now()}`;

const uniqueSlug = async (name, wanted) => {
  if (wanted) return wanted;
  const base = slugBase(name);
  let slug = base;
  for (let n = 2; await IndustryModel.findOne({ where: { slug }, attributes: ["id"] }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
};

const slugTaken = async (slug, excludeId) => {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return !!(await IndustryModel.findOne({ where, attributes: ["id"] }));
};

const create = async (data) => {
  const slug = await uniqueSlug(data.name, data.slug);
  return IndustryModel.create({ ...data, slug });
};

// active_only: the public site. The list leaves out the long body (`content`)
// unless full is set; the page itself loads it by slug.
const getAll = async ({ active_only = false, full = true } = {}) => {
  const where = {};
  if (active_only) where.is_active = true;
  return IndustryModel.findAll({
    where,
    attributes: full ? undefined : { exclude: ["content"] },
    order: [["display_order", "ASC"], ["name", "ASC"]],
  });
};

const getBySlug = async (slug) => IndustryModel.findOne({ where: { slug } });
const getById = async (id) => IndustryModel.findByPk(id);
const updateById = async (id, data) => {
  const [updated, rows] = await IndustryModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => IndustryModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getById, updateById, deleteById, slugTaken };
