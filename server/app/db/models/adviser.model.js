"use strict";
import { DataTypes, Op } from "sequelize";
import slugify from "slugify";

let AdviserModel = null;

const TABLE = "advisers";
const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  AdviserModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING(160), allowNull: false },
      // Address of the person's profile page (/team/<slug>).
      slug: { type: DataTypes.STRING(200), allowNull: true, unique: true },
      designation: { type: DataTypes.STRING(200), allowNull: true },
      bio: { type: DataTypes.TEXT, allowNull: true },
      // Areas of expertise, one per line.
      expertise: { type: DataTypes.TEXT, allowNull: true },
      photo: { type: DataTypes.STRING(500), allowNull: true },
      linkedin_url: { type: DataTypes.STRING(500), allowNull: true },
      // Heading the person is listed under on the website (e.g. "Leadership").
      team_group: { type: DataTypes.STRING(100), allowNull: true },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // A labelled stand-in shown until the real person's details arrive.
      is_placeholder: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await AdviserModel.sync({ alter: false, force: false });
};

const slugBase = (name) => makeSlug(name) || `team-member-${Date.now()}`;

// Slug for a person: the one given, or one made from the name that does not
// clash with another person (adds -2, -3, ...).
const uniqueSlug = async (name, wanted, excludeId) => {
  if (wanted) return wanted;
  const base = slugBase(name);
  let slug = base;
  for (let n = 2; await slugTaken(slug, excludeId); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
};

// Is the slug already used by another person?
const slugTaken = async (slug, excludeId) => {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return !!(await AdviserModel.findOne({ where, attributes: ["id"] }));
};

const create = async (data) => {
  const slug = await uniqueSlug(data.name, data.slug);
  return AdviserModel.create({ ...data, slug });
};

// Admin: every adviser (q filters by name / designation / group).
// Public: active_only. Ordered the way the website lists them.
const getAll = async ({ active_only = false, q } = {}) => {
  const where = {};
  if (active_only) where.is_active = true;
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { designation: { [Op.iLike]: `%${q}%` } },
      { team_group: { [Op.iLike]: `%${q}%` } },
    ];
  }
  return AdviserModel.findAll({ where, order: [["display_order", "ASC"], ["name", "ASC"]] });
};

const getById = async (id) => AdviserModel.findByPk(id);
const getBySlug = async (slug) => AdviserModel.findOne({ where: { slug } });

const updateById = async (id, data) => {
  const current = await AdviserModel.findByPk(id);
  if (!current) return null;
  // A cleared slug (or a person who never had one) gets one made from the name.
  if (("slug" in data && !data.slug) || (!("slug" in data) && !current.slug)) {
    data.slug = await uniqueSlug(data.name ?? current.name, null, id);
  }
  const [, rows] = await AdviserModel.update(data, { where: { id }, returning: true });
  return rows[0] ?? current;
};

const deleteById = async (id) => AdviserModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getById, updateById, deleteById, slugTaken };
