"use strict";
import { DataTypes, Op } from "sequelize";
import slugify from "slugify";

let CaseStudyModel = null;

const TABLE = "case_studies";
const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  CaseStudyModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
      client_name: { type: DataTypes.STRING(200), allowNull: true },
      industry: { type: DataTypes.STRING(120), allowNull: true },
      challenge: { type: DataTypes.TEXT, allowNull: true },
      solution: { type: DataTypes.TEXT, allowNull: true },
      result: { type: DataTypes.TEXT, allowNull: true },
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
      published_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await CaseStudyModel.sync({ alter: false, force: false });
};

const create = async (data) => {
  if (!data.slug) data.slug = makeSlug(data.title);
  if (data.is_published && !data.published_at) data.published_at = new Date();
  return CaseStudyModel.create(data);
};

const getAll = async ({ published_only = false, q, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (published_only) where.is_published = true;
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { client_name: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await CaseStudyModel.findAndCountAll({
    where,
    order: [["published_at", "DESC"], ["created_at", "DESC"]],
    limit,
    offset,
  });
  return { total: count, page, limit, totalPages: Math.ceil(count / limit), data: rows };
};

const getBySlug = async (slug) => CaseStudyModel.findOne({ where: { slug } });
const getById = async (id) => CaseStudyModel.findByPk(id);
const updateById = async (id, data) => {
  if (data.is_published && !data.published_at) data.published_at = new Date();
  const [updated, rows] = await CaseStudyModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => CaseStudyModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getById, updateById, deleteById };
