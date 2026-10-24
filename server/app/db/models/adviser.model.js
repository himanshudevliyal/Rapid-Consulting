"use strict";
import { DataTypes, Op } from "sequelize";

let AdviserModel = null;

const TABLE = "advisers";

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
      designation: { type: DataTypes.STRING(200), allowNull: true },
      bio: { type: DataTypes.TEXT, allowNull: true },
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
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await AdviserModel.sync({ alter: false, force: false });
};

const create = async (data) => AdviserModel.create(data);

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

const updateById = async (id, data) => {
  const [updated, rows] = await AdviserModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};

const deleteById = async (id) => AdviserModel.destroy({ where: { id } });

export default { init, create, getAll, getById, updateById, deleteById };
