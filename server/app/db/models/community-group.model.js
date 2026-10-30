"use strict";
import { DataTypes, Op } from "sequelize";

let CommunityGroupModel = null;

const TABLE = "community_groups";

const init = async (sequelize) => {
  CommunityGroupModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING(200), allowNull: false },
      audience: { type: DataTypes.STRING(255), allowNull: true },
      // What members receive, one bullet per line.
      updates: { type: DataTypes.TEXT, allowNull: true },
      cadence: { type: DataTypes.STRING(200), allowNull: true },
      // Empty until the group has an invite link.
      join_url: { type: DataTypes.STRING(500), allowNull: true },
      // Pages the group is shown on: home, industries, resources, advisers, schemes.
      placements: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    }
  );

  await CommunityGroupModel.sync({ alter: false, force: false });
};

const create = async (data) => CommunityGroupModel.create(data);

const ORDER = [["sort_order", "ASC"], ["name", "ASC"]];

// Admin list: every group (q filters by name / audience), paginated.
const getAll = async ({ q, is_active, page = 1, limit = 20 } = {}) => {
  const clauses = [];
  if (is_active === true || is_active === false) clauses.push({ is_active });
  if (q) {
    clauses.push({
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { audience: { [Op.iLike]: `%${q}%` } },
      ],
    });
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await CommunityGroupModel.findAndCountAll({
    where: clauses.length ? { [Op.and]: clauses } : {},
    order: ORDER,
    limit,
    offset,
  });
  return { total: count, page, limit, totalPages: Math.ceil(count / limit), data: rows };
};

// Public: active groups in display order, only those shown on `placement`
// when one is given. The list is short, so the placement is matched here.
const getPublic = async ({ placement } = {}) => {
  const rows = await CommunityGroupModel.findAll({ where: { is_active: true }, order: ORDER });
  const groups = rows.map((row) => row.toJSON());
  return placement
    ? groups.filter((group) => Array.isArray(group.placements) && group.placements.includes(placement))
    : groups;
};

const getById = async (id) => CommunityGroupModel.findByPk(id);
const updateById = async (id, data) => {
  const [updated, rows] = await CommunityGroupModel.update(data, { where: { id }, returning: true });
  return updated ? rows[0] : null;
};
const deleteById = async (id) => CommunityGroupModel.destroy({ where: { id } });

export default { init, create, getAll, getPublic, getById, updateById, deleteById };
