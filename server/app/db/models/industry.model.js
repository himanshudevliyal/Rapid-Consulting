"use strict";
import { DataTypes } from "sequelize";
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
      name: { type: DataTypes.STRING(160), allowNull: false },
      slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      icon: { type: DataTypes.STRING(500), allowNull: true },
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
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await IndustryModel.sync({ alter: false, force: false });
};

const create = async (data) => {
  if (!data.slug) data.slug = makeSlug(data.name);
  return IndustryModel.create(data);
};

const getAll = async ({ active_only = false } = {}) => {
  const where = {};
  if (active_only) where.is_active = true;
  return IndustryModel.findAll({ where, order: [["display_order", "ASC"], ["name", "ASC"]] });
};

const getBySlug = async (slug) => IndustryModel.findOne({ where: { slug } });
const getById = async (id) => IndustryModel.findByPk(id);
const updateById = async (id, data) => {
  const [updated, rows] = await IndustryModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => IndustryModel.destroy({ where: { id } });

export default { init, create, getAll, getBySlug, getById, updateById, deleteById };
