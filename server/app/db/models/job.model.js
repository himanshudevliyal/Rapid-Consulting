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

const slugBase = (title) => makeSlug(title) || `job-${Date.now()}`;

// A slug typed by the editor is used as is (the caller checks it is free);
// otherwise one is made from the title: "title", "title-2", "title-3"...
const uniqueSlug = async (title, wanted) => {
  if (wanted) return wanted;
  const base = slugBase(title);
  let slug = base;
  for (let n = 2; await JobModel.findOne({ where: { slug }, attributes: ["id"] }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
};

const slugTaken = async (slug, excludeId) => {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return !!(await JobModel.findOne({ where, attributes: ["id"] }));
};

const create = async (data) => {
  const slug = await uniqueSlug(data.title, data.slug);
  return JobModel.create({ ...data, slug });
};

// active_only: the public site - active jobs whose closing date has not passed.
// is_active ("true" | "false"): admin filter.
const getAll = async ({ active_only = false, is_active, q, page = 1, limit = 20 } = {}) => {
  const clauses = [];
  if (active_only) {
    const today = new Date().toISOString().slice(0, 10);
    clauses.push({ is_active: true });
    clauses.push({ [Op.or]: [{ closing_date: null }, { closing_date: { [Op.gte]: today } }] });
  } else if (is_active === true || is_active === false) {
    clauses.push({ is_active });
  }
  if (q) {
    clauses.push({
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { location: { [Op.iLike]: `%${q}%` } },
      ],
    });
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await JobModel.findAndCountAll({
    where: clauses.length ? { [Op.and]: clauses } : {},
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

export default { init, create, getAll, getBySlug, getById, updateById, deleteById, slugTaken };
