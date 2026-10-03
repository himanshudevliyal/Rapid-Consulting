"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

const { DataTypes, QueryTypes, Deferrable } = sequelizeFwk;

let CartModel = null;

const init = async (sequelize) => {
  CartModel = sequelize.define(
    constants.models.CART_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.PRODUCT_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return CartModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  return await CartModel.create(
    {
      user_id: req.user_data.id,
      product_id: req.body.product_id,
      quantity: req.body.quantity,
    },
    options,
  );
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req?.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await CartModel.update({ quantity: req.body.quantity }, options);
};

const get = async (req) => {
  const whereConditions = [`crt.user_id = :userId`];
  const queryParams = { userId: req.user_data.id };

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const query = `
    SELECT 
      crt.*,
      prd.title,
      prd.hero,
      prd.gallery,
      COALESCE(stk.stock, 0) AS stock
    FROM ${constants.models.CART_TABLE} crt
    LEFT JOIN ${constants.models.PRODUCT_TABLE} prd ON prd.id = crt.product_id
    LEFT JOIN ${constants.models.INVENTORY_TABLE} stk ON stk.product_id = crt.product_id
    ${whereClause}
`;

  return await CartModel.sequelize.query(query, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const getById = async (req, id) => {
  return await CartModel.findOne({
    where: {
      id: req.params.id || id,
    },
    raw: true,
    plain: true,
  });
};

const getByUserAndProductId = async (req) => {
  return await CartModel.findOne({
    where: {
      user_id: req.user_data.id,
      product_id: req.body.product_id,
    },
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await CartModel.destroy({
    where: { id: req?.params?.id || id },
    returning: true,
  });
};
const deleteByUserId = async (req, id, transaction = null) => {
  const options = {
    where: { user_id: req?.user_data?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await CartModel.destroy(options);
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
  deleteByUserId: deleteByUserId,
  getByUserAndProductId: getByUserAndProductId,
};
