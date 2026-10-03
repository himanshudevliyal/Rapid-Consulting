// models/order.js
"use strict";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";
import constants from "../../lib/constants/index.js";

let OrderModel = null;

const init = async (sequelize) => {
  OrderModel = sequelize.define(
    constants.models.ORDER_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
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
      order_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      shipping_fee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      shipping_address: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      billing_address: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      order_status: {
        type: DataTypes.ENUM([
          "Pending",
          "Order Accepted",
          "Order Processing",
          "In Transit",
          "Out For Delivery",
          "Delivered",
          "Canceled",
        ]),
        defaultValue: "Pending",
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_inter_state: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      transaction_id: {
        type: DataTypes.STRING,
        allow: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return OrderModel;
};

const create = async (req, transaction) => {
  const latest = await OrderModel.findOne({
    attributes: ["order_no"],
    order: [["created_at", "DESC"]],
    raw: true,
  });

  let newOrderNo = "ORD-0001";
  if (latest?.order_no) {
    const number = parseInt(latest.order_no.split("-")[1]);
    const nextNumber = number + 1;
    newOrderNo = `ORD-${String(nextNumber).padStart(4, "0")}`;
  }

  const latestInvoice = await OrderModel.findOne({
    attributes: ["invoice_number"],
    order: [["created_at", "DESC"]],
    raw: true,
  });
  let newInvoiceNo = "INV-0001";
  if (latestInvoice?.invoice_number) {
    const number = parseInt(latestInvoice.invoice_number.split("-")[1]);
    const nextNumber = number + 1;
    newInvoiceNo = `INV-${String(nextNumber).padStart(4, "0")}`;
  }

  const options = {};
  if (transaction) options.transaction = transaction;
  const { role, id } = req.user_data;
  const userId = role === "user" ? id : req.body.user_id;

  const order = await OrderModel.create(
    {
      user_id: userId,
      invoice_number: newInvoiceNo,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      shipping_fee: req.body.shipping_fee,
      total: req.body.total,
      shipping_address: req.body.shipping_address,
      billing_address: req.body.billing_address,
      order_status: req.body.order_status,
      payment_method: req.body.payment_method,
    },
    options,
  );

  const orderNo = `ORD${String(order.id).padStart(6, "0")}`;

  await OrderModel.update(
    { order_no: orderNo },
    { where: { id: order.id }, transaction },
  );

  return { ...order.dataValues, order_no: orderNo };
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await OrderModel.update(
    { order_status: req.body.order_status, is_paid: req.body.is_paid },
    options,
  );
};

const getById = async (req, id, transaction) => {
  const query = `
    SELECT 
        ord.*,
        usr.fullname, usr.email, usr.mobile_number
      FROM ${constants.models.ORDER_TABLE} ord
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = ord.user_id
      WHERE ord.id = :id
  `;

  const options = {
    replacements: { id: req.params?.id || id },
    type: QueryTypes.SELECT,
    plain: 1,
    raw: 1,
  };
  if (transaction) options.transaction = transaction;

  return await OrderModel.sequelize.query(query, options);
};

const deleteById = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await OrderModel.destroy(options);
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const { role, id } = req.user_data;
  if (role === "user") {
    whereConditions.push(`ord.user_id = :userId`);
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      "ord.order_number ILIKE :query OR usr.fullname ILIKE :query OR usr.email ILIKE :query OR usr.mobile_number ILIKE :query",
    );
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
      ord.*,
      usr.fullname, usr.email, usr.mobile_number
    FROM ${constants.models.ORDER_TABLE} ord
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = ord.user_id
    ${whereClause}
    ORDER BY ord.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(ord.id) OVER()::integer as total
    FROM ${constants.models.ORDER_TABLE} ord
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = ord.user_id
    ${whereClause}
  `;

  const orders = await OrderModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await OrderModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { orders, total: count?.total ?? 0 };
};

const getOrderStats = async () => {
  const query = `
    SELECT 
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (WHERE order_status = 'Delivered')::int AS delivered,
      COUNT(*) FILTER (WHERE order_status = 'In Transit')::int AS in_transit,
      COUNT(*) FILTER (WHERE order_status = 'Order Processing')::int AS processing
    FROM ${constants.models.ORDER_TABLE};
  `;

  return await OrderModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const getRevenueByMonth = async () => {
  const query = `
    SELECT 
      DATE_TRUNC('month', created_at) AS month,
      SUM(total)::numeric(12,2) AS revenue,
      COUNT(*)::int AS orders_count
    FROM ${constants.models.ORDER_TABLE}
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC;
  `;

  return await OrderModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });
};

const getOrdersLast7Days = async () => {
  const ordersTrendQuery = `
      SELECT 
        DATE(created_at) AS day,
        COUNT(id)::int AS orders_count,
        SUM(total)::numeric(12,2) AS revenue
      FROM ${constants.models.ORDER_TABLE}
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC;
    `;
  return await OrderModel.sequelize.query(ordersTrendQuery, {
    type: QueryTypes.SELECT,
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getById: getById,
  get: get,
  deleteById: deleteById,
  getOrderStats: getOrderStats,
  getRevenueByMonth: getRevenueByMonth,
  getOrdersLast7Days: getOrdersLast7Days,
};
