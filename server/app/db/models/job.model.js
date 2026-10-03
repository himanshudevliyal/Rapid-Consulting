"use strict";
import { DataTypes, Op } from "sequelize";
import slugify from "slugify";

let JobModel = null;

const TABLE = "jobs";
const makeSlug = (value) => slugify(value, { lower: true, strict: true });

const init = async (sequelize) => {
  JobModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
      location: { type: DataTypes.STRING(200), allowNull: true },
      job_type: {
        type: DataTypes.ENUM("full-time", "part-time", "contract", "internship", "remote"),
        allowNull: false,
        defaultValue: "full-time",
      },
      experience: { type: DataTypes.STRING(100), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      responsibilities: { type: DataTypes.TEXT, allowNull: true },
      requirements: { type: DataTypes.TEXT, allowNull: true },
      closing_date: { type: DataTypes.DATEONLY, allowNull: true },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await JobModel.sync({ alter: false, force: false });
};

const create = async (data) => {
  if (!data.slug) data.slug = makeSlug(data.title);
  return JobModel.create(data);
};

const getAll = async ({ active_only = false, q, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (active_only) where.is_active = true;
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { location: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await JobModel.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return { total: count, page, limit, totalPages: Math.ceil(count / limit), data: rows };
};

const getBySlug = async (slug) => JobModel.findOne({ where: { slug } });
const getById = async (id) => JobModel.findByPk(id);
const updateById = async (id, data) => {
  const [updated, rows] = await JobModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => JobModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getById, updateById, deleteById };
