"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

const { DataTypes, QueryTypes, Deferrable } = sequelizeFwk;

let OrderItemModel = null;

const init = async (sequelize) => {
  OrderItemModel = sequelize.define(
    constants.models.ORDER_ITEM_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true,
      },
      order_item_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: constants.models.ORDER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.PRODUCT_TABLE,
          key: "id",
        },
        onDelete: "CASCADE",
      },
      product_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["order_id"] }, { fields: ["product_id"] }],
    },
  );

  return OrderItemModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const orderItem = await OrderItemModel.create(
    {
      user_id: req.user_data.id,
      product_id: req.body.product_id,
      quantity: req.body.quantity,
      total: req.body.total,
      sub_total: req.body.sub_total,
      product_price: req.body.product_price,
    },
    options,
  );

  const orderItemNo = `ORDI${String(orderItem.id).padStart(6, "0")}`;

  await OrderItemModel.update(
    { order_item_no: orderItemNo },
    {
      where: { id: orderItem.id },
      transaction,
    },
  );

  return { ...orderItem.dataValues, order_item_no: orderItemNo };
};

const bulkCreate = async (list, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  return await OrderItemModel.bulkCreate(list, options);
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req?.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await OrderItemModel.update(
    {
      quantity: req.body.quantity,
      total: req.body.total,
      product_price: req.body.product_price,
    },
    options,
  );
};

const get = async (req) => {
  const whereConditions = [`crt.user_id = :userId`];
  const queryParams = { userId: req.user_data.id };

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const query = `
    SELECT 
      crt.id, crt.user_id, crt.created_at, 
      prd.title, prd.hero, prd.gallery, prd.id as product_id
    FROM ${constants.models.CART_TABLE} crt
    LEFT JOIN ${constants.models.PRODUCT_TABLE} prd ON prd.id = crt.product_id
    ${whereClause}
`;

  return await OrderItemModel.sequelize.query(query, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const getById = async (req, id) => {
  return await OrderItemModel.findOne({
    where: {
      id: req.params.id || id,
    },
    raw: true,
    plain: true,
  });
};

const getByUserAndProductId = async (req) => {
  return await OrderItemModel.findOne({
    where: {
      user_id: req.user_data.id,
      product_id: req.body.product_id,
    },
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await OrderItemModel.destroy({
    where: { id: req?.params?.id || id },
    returning: true,
  });
};
const deleteByUserId = async (req, id, transaction = null) => {
  const options = {
    where: { user_id: req?.user_data?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await OrderItemModel.destroy(options);
};

const getByOrderId = async (req, orderId) => {
  const whereConditions = [`oi.order_id = :orderId`];
  const queryParams = { orderId: req?.params?.id || orderId };

  // const { role, id } = req.user_data;
  // if (role === "user") {
  //   whereConditions.push(`oi.user_id = :userId`);
  //   queryParams.userId = id;
  // }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push();
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
      oi.*,
      prd.title, COALESCE(prd.gallery->'images', '[]') as pictures,
      cat.title as category, cat.slug as category_slug, cat.id as category_id
    FROM ${constants.models.ORDER_ITEM_TABLE} oi
    LEFT JOIN ${constants.models.PRODUCT_TABLE} prd ON prd.id = oi.product_id
    LEFT JOIN ${constants.models.CATEGORY_TABLE} cat ON cat.id = prd.category_id
    ${whereClause}
    ORDER BY oi.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(oi.id) OVER()::integer as total
    FROM ${constants.models.ORDER_ITEM_TABLE} oi
    LEFT JOIN ${constants.models.PRODUCT_TABLE} prd ON prd.id = oi.product_id
    LEFT JOIN ${constants.models.CATEGORY_TABLE} cat ON cat.id = prd.category_id
    ${whereClause}
  `;

  const items = await OrderItemModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await OrderItemModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { items, total: count?.total ?? 0 };
};

export default {
  init: init,
  create: create,
  bulkCreate: bulkCreate,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
  deleteByUserId: deleteByUserId,
  getByUserAndProductId: getByUserAndProductId,
  getByOrderId: getByOrderId,
};
