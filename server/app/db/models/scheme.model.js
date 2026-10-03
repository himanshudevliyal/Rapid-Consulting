"use strict";
import { DataTypes, Op } from "sequelize";
import slugify from "slugify";

let SchemeModel = null;

const TABLE = "schemes";
const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  SchemeModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
      ministry: { type: DataTypes.STRING(255), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      eligibility: { type: DataTypes.TEXT, allowNull: true },
      benefits: { type: DataTypes.TEXT, allowNull: true },
      application_process: { type: DataTypes.TEXT, allowNull: true },
      official_url: { type: DataTypes.STRING(500), allowNull: true },
      cover_image: { type: DataTypes.STRING(500), allowNull: true },
      tags: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      is_published: {
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

  await SchemeModel.sync({ alter: false, force: false });
};

const create = async (data) => {
  if (!data.slug) data.slug = makeSlug(data.name);
  return SchemeModel.create(data);
};

const getAll = async ({ published_only = false, q, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (published_only) where.is_published = true;
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { ministry: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await SchemeModel.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    limit,
    offset,
  });
  return { total: count, page, limit, totalPages: Math.ceil(count / limit), data: rows };
};

const getBySlug = async (slug) => SchemeModel.findOne({ where: { slug } });
const getById = async (id) => SchemeModel.findByPk(id);
const updateById = async (id, data) => {
  const [updated, rows] = await SchemeModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => SchemeModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getById, updateById, deleteById };
