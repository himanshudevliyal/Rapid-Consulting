"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let UserAddressModel = null;

const init = async (sequelize) => {
  UserAddressModel = sequelize.define(
    constants.models.USER_ADDRESS_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      address: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["user_id"] }],
    },
  );

  return UserAddressModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await UserAddressModel.create(
    {
      user_id: req.user_data.id,
      address: req.body.address,
    },
    options,
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  return await UserAddressModel.update(
    {
      address: req.body.address,
      is_primary: req.body.is_primary,
    },
    {
      where: { id: req?.params?.id || id },
      returning: true,
      raw: true,
      transaction,
    },
  );
};

const updateBy = async (condition) => {
  return await UserAddressModel.update(condition);
};

const get = async (req) => {
  const whereConditions = [`add.user_id = :userId`];
  const queryParams = { userId: req.user_data.id };
  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(`(cat.user_id ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
  SELECT 
    add.*
  FROM ${constants.models.USER_ADDRESS_TABLE} add
  ${whereClause}
  ORDER BY add.created_at DESC
  LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
    COUNT(add.id) OVER()::integer as total
  FROM ${constants.models.USER_ADDRESS_TABLE} add
  ${whereClause}
  `;

  const addresses = await UserAddressModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await UserAddressModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { addresses, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await UserAddressModel.findOne({
    where: {
      id: req?.params?.id || id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id, transaction) => {
  return await UserAddressModel.destroy({
    where: { id: req.params?.id || id },
    transaction,
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getById: getById,
  deleteById: deleteById,
  get: get,
  updateBy: updateBy,
};
